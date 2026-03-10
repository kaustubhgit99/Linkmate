import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
}
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const ROOM_TYPES = ['Single Room','Double Room','Studio Apartment','1 BHK','2 BHK','3 BHK','PG / Hostel','Flat / Apartment']
export const AMENITIES_LIST = ['WiFi','AC','Heating','Parking','Gym','Swimming Pool','Laundry','Kitchen','Furnished','Security','CCTV','Power Backup','Water 24/7','Geyser','TV','Balcony','Pet Friendly','Meals Included']
export const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Surat','Lucknow','Indore','Bhopal','Patna','Vadodara','Coimbatore','Kochi','Nagpur']
