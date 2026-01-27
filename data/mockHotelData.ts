// data/mockHotelData.ts
import { HotelData, GuestAllocation } from '../types/hotel.ts';

const guests: GuestAllocation[] = [
    {
        id: 'g_1',
        fullName: 'Mohamed Ahmed',
        normalizedName: 'mohamed ahmed محمد احمد',
        roomNumber: '102',
        roomType: 'DOUBLE',
        roommates: ['Aly Hassan'],
        checkIn: '2026-06-15',
        checkOut: '2026-06-20',
        tags: ['mohamed', 'ahmed'],
        lastUpdated: Date.now()
    },
    {
        id: 'g_2',
        fullName: 'Aly Hassan',
        normalizedName: 'aly hassan علي حسن',
        roomNumber: '102',
        roomType: 'DOUBLE',
        roommates: ['Mohamed Ahmed'],
        checkIn: '2026-06-15',
        checkOut: '2026-06-20',
        tags: ['aly', 'hassan', 'ali'],
        lastUpdated: Date.now()
    },
    {
        id: 'g_3',
        fullName: 'Sarah Adel',
        normalizedName: 'sarah adel سارة عادل',
        roomNumber: '305',
        building: 'Annex',
        floor: '3rd',
        roomType: 'TRIPLE',
        roommates: ['Nour Ehab', 'Mariam Tarek'],
        checkIn: '2026-06-15',
        checkOut: '2026-06-20',
        tags: ['sarah', 'adel'],
        lastUpdated: Date.now()
    },
    {
        id: 'g_4',
        fullName: 'Mohamed Ibrahim',
        normalizedName: 'mohamed ibrahim محمد ابراهيم',
        roomNumber: '210',
        roomType: 'SINGLE',
        roommates: [], // Alone
        checkIn: '2026-06-16',
        checkOut: '2026-06-19',
        tags: ['mohamed', 'ibrahim'],
        lastUpdated: Date.now()
    },
    {
        id: 'g_5',
        fullName: 'Khaled & Family',
        normalizedName: 'khaled family خالد اسرة عائلة',
        roomNumber: 'Villa 4',
        building: 'Villas',
        roomType: 'FAMILY',
        roommates: ['Om Khaled', 'Khaled Jr'],
        checkIn: '2026-06-15',
        checkOut: '2026-06-22',
        tags: ['khaled', 'family'],
        lastUpdated: Date.now()
    }
];

export const MOCK_HOTEL_DATA: HotelData = {
    propetyName: 'Sobek Grand Resort',
    lastUpdated: new Date().toISOString(),
    guests
};
