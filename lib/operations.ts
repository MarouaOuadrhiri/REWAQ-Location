import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from './db';
import { hash } from './auth';
import { available, lockVehicles, settings } from './reservations';
import { dates, rentalQuote } from './pricing';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
const json=(value:unknown)=>JSON.parse(JSON.stringify(value));
export async function publicOperations(req:NextRequest, segments:string[]) {
 if(segments[0]==='availability' && segments[1] && req.method==='GET') {
  const car=await db.vehicle.findFirstOrThrow({where:{id:segments[1],archived:false}}), config=await settings();
  const start=new Date(new Date().toISOString().slice(0,10)), end=new Date(+start+180*86400000);
  const reservations=await db.reservation.findMany({where:{vehicleId:car.id,pickupAt:{lt:end},returnAt:{gt:start},OR:[{status:{in:['CONFIRMED','ACTIVE']}},...(config.pendingBlocks?[{status:'PENDING' as const,expiresAt:{gt:new Date()}}]:[])]},select:{pickupAt:true,returnAt:true}});
  const blocks=await db.vehicleMaintenance.findMany({where:{vehicleId:car.id,cancelledAt:null,startAt:{lt:end},endAt:{gt:start}},select:{startAt:true,endAt:true}});
  return NextResponse.json({start,end,unavailable:[...reservations.map(v=>({start:v.pickupAt,end:v.returnAt})),...blocks.map(v=>({start:v.startAt,end:v.endAt}))]});
 }
 if(segments[0]==='booking-requests' && req.method==='POST') {
  const input=z.object({reference:z.string(),token:z.string().min(20),kind:z.enum(['CHANGE','CANCEL']),message:z.string().trim().min(10).max(2000)}).parse(await req.json());
  return NextResponse.json(await db.$transaction(async tx=>{
   const initial=await tx.reservation.findFirstOrThrow({where:{reference:input.reference,accessTokenHash:hash(input.token)}});
   await lockVehicles(tx,[initial.vehicleId]);
   const booking=await tx.reservation.findUniqueOrThrow({where:{id:initial.id}});
   if(!['PENDING','CONFIRMED'].includes(booking.status)||booking.status==='PENDING'&&booking.expiresAt&&booking.expiresAt<=new Date())throw new Error('This reservation no longer accepts change requests. Contact our team.');
   if(await tx.bookingRequest.count({where:{reservationId:booking.id,status:'OPEN'}}))throw new Error('A request is already awaiting review.');
   const request=await tx.bookingRequest.create({data:{reservationId:booking.id,kind:input.kind,message:input.message}});
   await tx.reservationHistory.create({data:{reservationId:booking.id,action:'CUSTOMER_REQUESTED_'+input.kind,after:json(request)}});
   return {ok:true};
  }));
 }
}
export async function adminOperations(req:NextRequest,segments:string[],user:{id:string;name:string}) {
 const [,resource,id]=segments;
 if(resource==='requests'&&id&&req.method==='PATCH') {
  const input=z.object({status:z.enum(['RESOLVED','DECLINED']),response:z.string().trim().min(3).max(2000)}).parse(await req.json());
  return NextResponse.json(await db.$transaction(async tx=>{
   const item=await tx.bookingRequest.findUniqueOrThrow({where:{id}});
   if(item.status!=='OPEN')throw new Error('This request has already been reviewed.');
   const changed=await tx.bookingRequest.updateMany({where:{id,status:'OPEN'},data:{...input,resolvedAt:new Date()}});
   if(!changed.count)throw new Error('Request changed; refresh and retry.');
   await tx.reservationHistory.create({data:{reservationId:item.reservationId,adminId:user.id,action:'REQUEST_REVIEWED',before:json(item),after:input}});
   return {ok:true};
  }));
 }
 if(resource==='inspection-photo'&&id&&req.method==='GET') {
  const inspection=await db.rentalInspection.findUniqueOrThrow({where:{id}}),index=Number(req.nextUrl.searchParams.get('index'));
  const files=inspection.photos as string[];
  if(!Number.isInteger(index)||!files[index])throw new Error('Photo not found.');
  const filename=path.basename(files[index]);
  return new NextResponse(new Uint8Array(await readFile(path.join(process.cwd(),'.runtime','inspections',filename))),{headers:{'Content-Type':filename.endsWith('.png')?'image/png':filename.endsWith('.webp')?'image/webp':'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }
 if(resource==='inspections'&&req.method==='POST') {
  const form=await req.formData();
  const input=z.object({reservationId:z.string(),kind:z.enum(['DEPARTURE','RETURN']),odometer:z.coerce.number().int().min(0).max(9999999),fuelPercent:z.coerce.number().int().min(0).max(100),conditionNotes:z.string().trim().min(3).max(4000)}).parse(Object.fromEntries(form));
  const checklist=['bodywork','tyres','lights','documents','equipment'].map(key=>({key,checked:form.get(key)==='on'}));
  if(checklist.some(v=>!v.checked))throw new Error('Complete each inspection check before saving. Record any issues in the condition notes.');
  const files=form.getAll('photos').filter((v):v is File=>v instanceof File&&v.size>0);
  if(files.length>6)throw new Error('Maximum six photos per inspection.');
  const uploads=[] as {name:string;buffer:Buffer}[];
  for(const file of files){if(file.size>5*1024*1024)throw new Error('Each photo must be under 5 MB.');const buffer=Buffer.from(await file.arrayBuffer());let ext='';if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(buffer[0]===255&&buffer[1]===216&&buffer[2]===255)ext='jpg';else if(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')ext='webp';if(!ext)throw new Error('Use PNG, JPEG or WebP photos.');uploads.push({name:randomUUID()+'.'+ext,buffer});}
  return NextResponse.json(await db.$transaction(async tx=>{
   const initial=await tx.reservation.findUniqueOrThrow({where:{id:input.reservationId}});await lockVehicles(tx,[initial.vehicleId]);
   const booking=await tx.reservation.findUniqueOrThrow({where:{id:initial.id},include:{vehicle:true,inspections:true}});
   if(input.kind==='DEPARTURE'&&booking.status!=='CONFIRMED'||input.kind==='RETURN'&&booking.status!=='ACTIVE')throw new Error('Departure requires a confirmed reservation; return requires an active rental.');
   if(input.kind==='DEPARTURE'&&(booking.pickupAt>new Date()||booking.returnAt<=new Date()))throw new Error('Departure must be during the booked rental period.');
   const departure=booking.inspections.find(v=>v.kind==='DEPARTURE');if(input.kind==='RETURN'&&departure&&input.odometer<departure.odometer)throw new Error('Return mileage cannot be lower than departure mileage.');
   if(booking.inspections.some(v=>v.kind===input.kind))throw new Error('This inspection is already saved.');
   await available(tx,booking.vehicleId,booking.pickupAt,booking.returnAt,booking.id);
   const quote=rentalQuote(booking.vehicle,await settings(tx),booking.pickupAt,booking.returnAt,booking.pickupLocation,booking.returnLocation);
   await mkdir(path.join(process.cwd(),'.runtime','inspections'),{recursive:true});for(const file of uploads)await writeFile(path.join(process.cwd(),'.runtime','inspections',file.name),file.buffer);
   const inspection=await tx.rentalInspection.create({data:{...input,checklist,photos:uploads.map(v=>v.name),adminName:user.name}});
   const after=await tx.reservation.update({where:{id:booking.id},data:{status:input.kind==='DEPARTURE'?'ACTIVE':'COMPLETED',total:quote.total,days:quote.days,pricingSnapshot:quote,expiresAt:null}});
   await tx.reservationHistory.create({data:{reservationId:booking.id,adminId:user.id,action:input.kind+'_INSPECTION',before:json({status:booking.status,total:booking.total}),after:json({inspection,booking:after})}});
   return {ok:true};
  },{timeout:20000}));
 }
 if(resource==='payments'&&req.method==='POST') {
  const input=z.object({reservationId:z.string(),amount:z.coerce.number().positive().max(10000000),method:z.enum(['Cash','Bank transfer','Card']),kind:z.enum(['RENTAL','RENTAL_REFUND','DEPOSIT','DEPOSIT_REFUND']).default('RENTAL'),memo:z.string().trim().max(190).optional()}).parse(await req.json());
  return NextResponse.json(await db.$transaction(async tx=>{
   const booking=await tx.reservation.findUniqueOrThrow({where:{id:input.reservationId}});await lockVehicles(tx,[booking.vehicleId]);
   const entries=await tx.payment.findMany({where:{reservationId:booking.id}});
   const balance=(deposit:boolean)=>entries.filter(p=>deposit?p.kind.startsWith('DEPOSIT'):!p.kind.startsWith('DEPOSIT')).reduce((sum,p)=>sum+(p.kind.endsWith('REFUND')?-1:1)*Math.round(Number(p.amount)*100),0);
   if(input.kind.endsWith('REFUND')&&Math.round(input.amount*100)>balance(input.kind.startsWith('DEPOSIT')))throw new Error('Refund exceeds the recorded balance.');
   const payment=await tx.payment.create({data:{...input,amount:Math.round(input.amount*100)/100}});
   await tx.reservationHistory.create({data:{reservationId:booking.id,adminId:user.id,action:'PAYMENT_'+input.kind,after:json(payment)}});return payment;
  }));
 }
}
