import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  POSTED_TO_DAT: 'bg-blue-500',
  CARRIER_ASSIGNED: 'bg-green-600',
  IN_TRANSIT: 'bg-blue-600',
  DELIVERED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  POSTED_TO_DAT: 'Posted to DAT',
  CARRIER_ASSIGNED: 'Committed',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// â”€â”€ Mock Shipments (used when API returns empty) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_SHIPMENTS = [
  { id: 's1', loadNumber: 'SH-10421', status: 'IN_TRANSIT', shipperRate: 2800, carrierRate: 2200, commodity: 'Auto Parts â€” Palletized', weight: 42000, customer: { name: 'Acme Manufacturing' }, carrier: { name: 'Eagle Freight Lines' }, createdAt: '2026-04-13T08:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Acme Detroit Plant', address: '4200 Industrial Pkwy', city: 'Detroit', state: 'MI', zip: '48201', scheduledAt: '2026-04-13T06:00:00Z' }, { type: 'DELIVERY', facilityName: 'Midwest Distribution', address: '8800 Commerce Dr', city: 'Nashville', state: 'TN', zip: '37210', scheduledAt: '2026-04-13T16:00:00Z' }] },
  { id: 's2', loadNumber: 'SH-10422', status: 'CARRIER_ASSIGNED', shipperRate: 3400, carrierRate: 2800, commodity: 'Refrigerated Produce', weight: 38000, customer: { name: 'Heartland Foods' }, carrier: { name: 'Arctic Cold Carriers' }, createdAt: '2026-04-13T10:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Heartland Warehouse', address: '1200 Foodway Blvd', city: 'Kansas City', state: 'MO', zip: '64101', scheduledAt: '2026-04-14T07:00:00Z' }, { type: 'DELIVERY', facilityName: 'Fresh Market Dallas', address: '5500 Market St', city: 'Dallas', state: 'TX', zip: '75201', scheduledAt: '2026-04-14T18:00:00Z' }] },
  { id: 's3', loadNumber: 'SH-10423', status: 'IN_TRANSIT', shipperRate: 1800, carrierRate: 1350, commodity: 'Consumer Electronics', weight: 32000, customer: { name: 'Pacific Retail Group' }, carrier: { name: 'Midwest Express Trucking' }, createdAt: '2026-04-12T14:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Pacific Retail DC', address: '1500 Retail Ave', city: 'Los Angeles', state: 'CA', zip: '90012', scheduledAt: '2026-04-12T08:00:00Z' }, { type: 'DELIVERY', facilityName: 'Phoenix Hub', address: '3300 Distribution Dr', city: 'Phoenix', state: 'AZ', zip: '85001', scheduledAt: '2026-04-12T18:00:00Z' }] },
  { id: 's4', loadNumber: 'SH-10424', status: 'PENDING', shipperRate: 2200, carrierRate: 0, commodity: 'Steel Coils â€” Flatbed', weight: 48000, customer: { name: 'Southeastern Steel' }, carrier: null, createdAt: '2026-04-14T06:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'SE Steel Mill', address: '7700 Steel Way', city: 'Birmingham', state: 'AL', zip: '35201', scheduledAt: '2026-04-15T08:00:00Z' }, { type: 'DELIVERY', facilityName: 'Gulf Coast Fabricators', address: '2200 Harbor Rd', city: 'Jacksonville', state: 'FL', zip: '32201', scheduledAt: '2026-04-15T20:00:00Z' }] },
  { id: 's5', loadNumber: 'SH-10425', status: 'DELIVERED', shipperRate: 1600, carrierRate: 1200, commodity: 'Industrial Chemicals', weight: 44000, customer: { name: 'Great Lakes Chemicals' }, carrier: { name: 'Thunder Road Inc.' }, createdAt: '2026-04-10T09:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'GL Chemical Plant', address: '900 Lake Shore Dr', city: 'Cleveland', state: 'OH', zip: '44101', scheduledAt: '2026-04-10T06:00:00Z' }, { type: 'DELIVERY', facilityName: 'Midwest Chem Depot', address: '3300 Depot Rd', city: 'Pittsburgh', state: 'PA', zip: '15201', scheduledAt: '2026-04-10T14:00:00Z' }] },
  { id: 's6', loadNumber: 'SH-10426', status: 'IN_TRANSIT', shipperRate: 1400, carrierRate: 1050, commodity: 'Dry Goods â€” Palletized', weight: 36000, customer: { name: 'NorthPoint Logistics' }, carrier: { name: 'Midwest Express Trucking' }, createdAt: '2026-04-13T11:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'NorthPoint Chicago', address: '2100 Commerce Blvd', city: 'Chicago', state: 'IL', zip: '60601', scheduledAt: '2026-04-13T10:00:00Z' }, { type: 'DELIVERY', facilityName: 'Indy Warehouse', address: '4400 Storage Ln', city: 'Indianapolis', state: 'IN', zip: '46201', scheduledAt: '2026-04-13T16:00:00Z' }] },
  { id: 's7', loadNumber: 'SH-10427', status: 'CARRIER_ASSIGNED', shipperRate: 2600, carrierRate: 2100, commodity: 'Medical Supplies', weight: 28000, customer: { name: 'Summit Healthcare' }, carrier: { name: 'Eagle Freight Lines' }, createdAt: '2026-04-14T07:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Summit Med Supply', address: '300 Health Pkwy', city: 'Nashville', state: 'TN', zip: '37201', scheduledAt: '2026-04-14T08:30:00Z' }, { type: 'DELIVERY', facilityName: 'Regional Medical Center', address: '1100 Medical Dr', city: 'Louisville', state: 'KY', zip: '40201', scheduledAt: '2026-04-14T15:00:00Z' }] },
  { id: 's8', loadNumber: 'SH-10428', status: 'PENDING', shipperRate: 3200, carrierRate: 0, commodity: 'Building Materials', weight: 45000, customer: { name: 'Acme Manufacturing' }, carrier: null, createdAt: '2026-04-14T09:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Acme Supply Yard', address: '800 Builders Rd', city: 'Detroit', state: 'MI', zip: '48202', scheduledAt: '2026-04-15T06:00:00Z' }, { type: 'DELIVERY', facilityName: 'Columbus Construction', address: '5500 Build Ave', city: 'Columbus', state: 'OH', zip: '43201', scheduledAt: '2026-04-15T14:00:00Z' }] },
  { id: 's9', loadNumber: 'SH-10429', status: 'DELIVERED', shipperRate: 1200, carrierRate: 900, commodity: 'Medical Equipment', weight: 22000, customer: { name: 'Summit Healthcare' }, carrier: { name: 'Thunder Road Inc.' }, createdAt: '2026-04-09T08:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Summit Med Supply', address: '300 Health Pkwy', city: 'Nashville', state: 'TN', zip: '37201', scheduledAt: '2026-04-09T08:00:00Z' }, { type: 'DELIVERY', facilityName: 'Memphis General Hospital', address: '2200 Hospital Blvd', city: 'Memphis', state: 'TN', zip: '38101', scheduledAt: '2026-04-09T14:00:00Z' }] },
  { id: 's10', loadNumber: 'SH-10430', status: 'POSTED_TO_DAT', shipperRate: 2400, carrierRate: 0, commodity: 'Automotive Parts', weight: 40000, customer: { name: 'Pacific Retail Group' }, carrier: null, createdAt: '2026-04-14T05:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Pacific Auto Parts', address: '6600 Auto Way', city: 'Houston', state: 'TX', zip: '77001', scheduledAt: '2026-04-15T07:00:00Z' }, { type: 'DELIVERY', facilityName: 'SE Auto Depot', address: '1800 Depot St', city: 'Atlanta', state: 'GA', zip: '30301', scheduledAt: '2026-04-15T20:00:00Z' }] },
  { id: 's11', loadNumber: 'SH-10431', status: 'DELIVERED', shipperRate: 1500, carrierRate: 1100, commodity: 'Paper Products', weight: 34000, customer: { name: 'NorthPoint Logistics' }, carrier: { name: 'Lone Star Logistics' }, createdAt: '2026-04-08T10:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Delta Paper Mill', address: '4400 Paper Ln', city: 'Memphis', state: 'TN', zip: '38103', scheduledAt: '2026-04-08T06:00:00Z' }, { type: 'DELIVERY', facilityName: 'NorthPoint Chicago', address: '2100 Commerce Blvd', city: 'Chicago', state: 'IL', zip: '60601', scheduledAt: '2026-04-08T18:00:00Z' }] },
  { id: 's12', loadNumber: 'SH-10432', status: 'IN_TRANSIT', shipperRate: 3100, carrierRate: 2500, commodity: 'Frozen Foods â€” Reefer', weight: 41000, customer: { name: 'Heartland Foods' }, carrier: { name: 'Arctic Cold Carriers' }, createdAt: '2026-04-13T04:00:00Z', stops: [{ type: 'PICKUP', facilityName: 'Heartland Cold Storage', address: '3300 Freeze Dr', city: 'Omaha', state: 'NE', zip: '68101', scheduledAt: '2026-04-13T05:00:00Z' }, { type: 'DELIVERY', facilityName: 'Denver Fresh Market', address: '7700 Market Blvd', city: 'Denver', state: 'CO', zip: '80201', scheduledAt: '2026-04-13T18:00:00Z' }] },
];

// â”€â”€ Mock Trucker Tools Location History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_TRACKING: Record<string, { provider: string; lastUpdate: string; lastLocation: string; delivery: string; pings: { time: string; location: string }[] }> = {
  's1': { provider: 'Trucker Tools', lastUpdate: '04/14/2026 08:12 PM', lastLocation: 'BOWLING GREEN, KY 42101 US', delivery: '8800 Commerce Dr, Nashville, TN 37210', pings: [{ time: '4/14/2026 20:12', location: 'BOWLING GREEN, KY 42101 US' }, { time: '4/14/2026 19:57', location: 'BOWLING GREEN, KY 42101' }, { time: '4/14/2026 19:42', location: 'FRANKLIN, KY 42134 US' }, { time: '4/14/2026 19:27', location: 'FRANKLIN, KY 42134' }, { time: '4/14/2026 19:12', location: 'PORTLAND, TN 37148 US' }, { time: '4/14/2026 18:57', location: 'PORTLAND, TN 37148' }, { time: '4/14/2026 18:42', location: 'SPRINGFIELD, TN 37172 US' }, { time: '4/14/2026 18:27', location: 'SPRINGFIELD, TN 37172' }, { time: '4/14/2026 18:12', location: 'CLARKSVILLE, TN 37040 US' }, { time: '4/14/2026 17:57', location: 'CLARKSVILLE, TN 37040' }, { time: '4/14/2026 17:42', location: 'OAK GROVE, KY 42262 US' }, { time: '4/14/2026 17:12', location: 'HOPKINSVILLE, KY 42240 US' }, { time: '4/14/2026 16:42', location: 'MADISONVILLE, KY 42431 US' }, { time: '4/14/2026 16:12', location: 'HENDERSON, KY 42420 US' }, { time: '4/14/2026 15:42', location: 'EVANSVILLE, IN 47708 US' }] },
  's3': { provider: 'Trucker Tools', lastUpdate: '04/14/2026 06:30 PM', lastLocation: 'QUARTZSITE, AZ 85346 US', delivery: '3300 Distribution Dr, Phoenix, AZ 85001', pings: [{ time: '4/14/2026 18:30', location: 'QUARTZSITE, AZ 85346 US' }, { time: '4/14/2026 18:00', location: 'BLYTHE, CA 92225 US' }, { time: '4/14/2026 17:30', location: 'DESERT CENTER, CA 92239 US' }, { time: '4/14/2026 17:00', location: 'INDIO, CA 92201 US' }, { time: '4/14/2026 16:30', location: 'PALM SPRINGS, CA 92262 US' }, { time: '4/14/2026 16:00', location: 'BEAUMONT, CA 92223 US' }] },
  's6': { provider: 'Trucker Tools', lastUpdate: '04/14/2026 02:15 PM', lastLocation: 'LAFAYETTE, IN 47901 US', delivery: '4400 Storage Ln, Indianapolis, IN 46201', pings: [{ time: '4/14/2026 14:15', location: 'LAFAYETTE, IN 47901 US' }, { time: '4/14/2026 13:45', location: 'WEST LAFAYETTE, IN 47906 US' }, { time: '4/14/2026 13:15', location: 'CRAWFORDSVILLE, IN 47933 US' }, { time: '4/14/2026 12:45', location: 'DANVILLE, IL 61832 US' }, { time: '4/14/2026 12:15', location: 'CHAMPAIGN, IL 61820 US' }, { time: '4/14/2026 11:45', location: 'JOLIET, IL 60431 US' }, { time: '4/14/2026 11:15', location: 'CHICAGO, IL 60601 US' }] },
  's12': { provider: 'Trucker Tools', lastUpdate: '04/14/2026 11:00 AM', lastLocation: 'NORTH PLATTE, NE 69101 US', delivery: '7700 Market Blvd, Denver, CO 80201', pings: [{ time: '4/14/2026 11:00', location: 'NORTH PLATTE, NE 69101 US' }, { time: '4/14/2026 10:30', location: 'GOTHENBURG, NE 69138 US' }, { time: '4/14/2026 10:00', location: 'KEARNEY, NE 68847 US' }, { time: '4/14/2026 09:30', location: 'GRAND ISLAND, NE 68801 US' }, { time: '4/14/2026 09:00', location: 'YORK, NE 68467 US' }, { time: '4/14/2026 08:30', location: 'LINCOLN, NE 68501 US' }, { time: '4/14/2026 08:00', location: 'OMAHA, NE 68101 US' }] },
};

// â”€â”€ Mock Documents per Shipment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ShipmentDoc { id: string; type: string; name: string; uploadedBy: string; uploadedAt: string; status: string; fileSize: string; }

const MOCK_DOCS: Record<string, ShipmentDoc[]> = {
  's1': [
    { id: 'doc1', type: 'RATE_CON', name: 'Rate_Confirmation_SH10421.pdf', uploadedBy: 'Karen Liu', uploadedAt: '2026-04-12T10:00:00Z', status: 'APPROVED', fileSize: '245 KB' },
    { id: 'doc2', type: 'BOL', name: 'BOL_SH10421_Signed.pdf', uploadedBy: 'Eagle Freight Lines', uploadedAt: '2026-04-13T06:30:00Z', status: 'RECEIVED', fileSize: '1.2 MB' },
    { id: 'doc3', type: 'CARRIER_PACKET', name: 'Eagle_Freight_Carrier_Packet.pdf', uploadedBy: 'System', uploadedAt: '2026-04-12T09:00:00Z', status: 'APPROVED', fileSize: '3.8 MB' },
    { id: 'doc4', type: 'INSURANCE_CERT', name: 'Eagle_Freight_COI_2026.pdf', uploadedBy: 'System', uploadedAt: '2026-04-12T09:00:00Z', status: 'APPROVED', fileSize: '890 KB' },
    { id: 'doc5', type: 'SCALE_TICKET', name: 'Scale_Ticket_Detroit.jpg', uploadedBy: 'Driver', uploadedAt: '2026-04-13T06:45:00Z', status: 'RECEIVED', fileSize: '450 KB' },
  ],
  's2': [
    { id: 'doc6', type: 'RATE_CON', name: 'Rate_Confirmation_SH10422.pdf', uploadedBy: 'Karen Liu', uploadedAt: '2026-04-13T10:30:00Z', status: 'APPROVED', fileSize: '230 KB' },
    { id: 'doc7', type: 'CARRIER_PACKET', name: 'Arctic_Cold_Carrier_Packet.pdf', uploadedBy: 'System', uploadedAt: '2026-04-13T10:00:00Z', status: 'APPROVED', fileSize: '4.1 MB' },
  ],
  's3': [
    { id: 'doc8', type: 'RATE_CON', name: 'Rate_Confirmation_SH10423.pdf', uploadedBy: 'Mike Santos', uploadedAt: '2026-04-11T14:00:00Z', status: 'APPROVED', fileSize: '210 KB' },
    { id: 'doc9', type: 'BOL', name: 'BOL_SH10423.pdf', uploadedBy: 'Midwest Express', uploadedAt: '2026-04-12T08:15:00Z', status: 'RECEIVED', fileSize: '980 KB' },
  ],
  's5': [
    { id: 'doc10', type: 'RATE_CON', name: 'Rate_Confirmation_SH10425.pdf', uploadedBy: 'Karen Liu', uploadedAt: '2026-04-09T08:00:00Z', status: 'APPROVED', fileSize: '225 KB' },
    { id: 'doc11', type: 'BOL', name: 'BOL_SH10425_Signed.pdf', uploadedBy: 'Thunder Road', uploadedAt: '2026-04-10T06:30:00Z', status: 'APPROVED', fileSize: '1.1 MB' },
    { id: 'doc12', type: 'POD', name: 'POD_SH10425_Signed.pdf', uploadedBy: 'Thunder Road', uploadedAt: '2026-04-10T14:20:00Z', status: 'APPROVED', fileSize: '1.4 MB' },
    { id: 'doc13', type: 'INVOICE', name: 'INV-20260310_GreatLakes.pdf', uploadedBy: 'System', uploadedAt: '2026-04-10T15:00:00Z', status: 'APPROVED', fileSize: '180 KB' },
    { id: 'doc14', type: 'LUMPER', name: 'Lumper_Receipt_Pittsburgh.jpg', uploadedBy: 'Driver', uploadedAt: '2026-04-10T14:10:00Z', status: 'RECEIVED', fileSize: '320 KB' },
  ],
  's7': [{ id: 'doc15', type: 'RATE_CON', name: 'Rate_Confirmation_SH10427.pdf', uploadedBy: 'Karen Liu', uploadedAt: '2026-04-14T07:30:00Z', status: 'PENDING', fileSize: '240 KB' }],
  's9': [
    { id: 'doc16', type: 'RATE_CON', name: 'Rate_Confirmation_SH10429.pdf', uploadedBy: 'Mike Santos', uploadedAt: '2026-04-08T08:00:00Z', status: 'APPROVED', fileSize: '215 KB' },
    { id: 'doc17', type: 'BOL', name: 'BOL_SH10429.pdf', uploadedBy: 'Thunder Road', uploadedAt: '2026-04-09T08:20:00Z', status: 'APPROVED', fileSize: '1.0 MB' },
    { id: 'doc18', type: 'POD', name: 'POD_SH10429_Signed.pdf', uploadedBy: 'Thunder Road', uploadedAt: '2026-04-09T14:30:00Z', status: 'APPROVED', fileSize: '1.3 MB' },
    { id: 'doc19', type: 'INVOICE', name: 'INV-20260301_SummitHC.pdf', uploadedBy: 'System', uploadedAt: '2026-04-09T15:00:00Z', status: 'APPROVED', fileSize: '175 KB' },
  ],
};

const DOC_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  BOL: { label: 'Bill of Lading', icon: 'ðŸ“‹', color: 'bg-blue-100 text-blue-800' },
  POD: { label: 'Proof of Delivery', icon: 'âœ…', color: 'bg-green-100 text-green-800' },
  RATE_CON: { label: 'Rate Confirmation', icon: 'ðŸ’°', color: 'bg-purple-100 text-purple-800' },
  CARRIER_PACKET: { label: 'Carrier Packet', icon: 'ðŸ“¦', color: 'bg-orange-100 text-orange-800' },
  INVOICE: { label: 'Invoice', icon: 'ðŸ§¾', color: 'bg-yellow-100 text-yellow-800' },
  LUMPER: { label: 'Lumper Receipt', icon: 'ðŸ·', color: 'bg-teal-100 text-teal-800' },
  SCALE_TICKET: { label: 'Scale Ticket', icon: 'âš–', color: 'bg-gray-100 text-gray-700' },
  INSURANCE_CERT: { label: 'Insurance Cert', icon: 'ðŸ›¡', color: 'bg-indigo-100 text-indigo-800' },
  OTHER: { label: 'Other', icon: 'ðŸ“Ž', color: 'bg-gray-100 text-gray-500' },
};
const DOC_STATUS_BADGE: Record<string, string> = { RECEIVED: 'bg-blue-100 text-blue-800', APPROVED: 'bg-green-100 text-green-800', PENDING: 'bg-yellow-100 text-yellow-800', REJECTED: 'bg-red-100 text-red-800' };

// â”€â”€ Load Board Posting Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface LoadBoardPosting { board: 'DAT' | 'TRUCKSTOP'; postedAt: string; views: number; contacts: number; rate: number; status: 'ACTIVE' | 'COVERED' | 'EXPIRED'; }

const MOCK_POSTINGS: Record<string, LoadBoardPosting[]> = {
  's4': [{ board: 'DAT', postedAt: '2026-04-14T06:30:00Z', views: 45, contacts: 3, rate: 2200, status: 'ACTIVE' }, { board: 'TRUCKSTOP', postedAt: '2026-04-14T06:30:00Z', views: 28, contacts: 1, rate: 2200, status: 'ACTIVE' }],
  's8': [{ board: 'DAT', postedAt: '2026-04-14T09:15:00Z', views: 12, contacts: 0, rate: 3200, status: 'ACTIVE' }],
  's10': [{ board: 'DAT', postedAt: '2026-04-14T05:15:00Z', views: 67, contacts: 5, rate: 2400, status: 'ACTIVE' }, { board: 'TRUCKSTOP', postedAt: '2026-04-14T05:15:00Z', views: 41, contacts: 2, rate: 2400, status: 'ACTIVE' }],
};

export function BrokerageShipments() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  const [form, setForm] = useState({
    customerId: '', commodity: '', weight: '', shipperRate: '', carrierRate: '',
    pickupFacility: '', pickupAddress: '', pickupCity: '', pickupState: '', pickupZip: '', pickupDate: '',
    deliveryFacility: '', deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryZip: '', deliveryDate: '',
  });

  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const { data: loads, isLoading } = useQuery({
    queryKey: ['broker-loads'],
    queryFn: async () => {
      const { data } = await api.get('/broker-loads');
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/customers');
      return data;
    },
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const { data } = await api.get('/carriers');
      return data;
    },
  });

  const [assignCarrierId, setAssignCarrierId] = useState('');
  const [assignCarrierRate, setAssignCarrierRate] = useState('');
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [detailTab, setDetailTab] = useState('activity');
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postingLoadId, setPostingLoadId] = useState<string | null>(null);
  const [postBoards, setPostBoards] = useState<{ dat: boolean; truckstop: boolean }>({ dat: true, truckstop: true });
  const [showCarrierMatch, setShowCarrierMatch] = useState(false);
  const [matchLoadId, setMatchLoadId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/broker-loads', {
        customerId: form.customerId,
        commodity: form.commodity,
        weight: parseFloat(form.weight) || 0,
        shipperRate: parseFloat(form.shipperRate),
        carrierRate: form.carrierRate ? parseFloat(form.carrierRate) : null,
        stops: [
          { type: 'PICKUP', facilityName: form.pickupFacility, address: form.pickupAddress, city: form.pickupCity, state: form.pickupState, zip: form.pickupZip, scheduledAt: form.pickupDate },
          { type: 'DELIVERY', facilityName: form.deliveryFacility, address: form.deliveryAddress, city: form.deliveryCity, state: form.deliveryState, zip: form.deliveryZip, scheduledAt: form.deliveryDate },
        ],
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-loads'] });
      setShowCreate(false);
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data } = await api.patch(`/broker-loads/${id}/assign-carrier`, {
        carrierId: assignCarrierId,
        carrierRate: parseFloat(assignCarrierRate),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-loads'] });
      setAssignCarrierId('');
      setAssignCarrierRate('');
    },
  });

  const allLoads = (loads && loads.length > 0) ? loads : MOCK_SHIPMENTS;

  const filtered = allLoads.filter((l: any) => {
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    const matchSearch = !searchText || l.loadNumber?.toLowerCase().includes(searchText.toLowerCase()) || l.customer?.name?.toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchSearch;
  });

  const selectedLoad = allLoads.find((l: any) => l.id === selectedId);

  if (selectedLoad) {
    const pickup = selectedLoad.stops?.[0];
    const delivery = selectedLoad.stops?.[selectedLoad.stops?.length - 1];
    const margin = (selectedLoad.shipperRate || 0) - (selectedLoad.carrierRate || 0);
    const marginPct = selectedLoad.shipperRate > 0 ? ((margin / selectedLoad.shipperRate) * 100).toFixed(1) : '0';

    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedId(null)} className="text-xs text-blue-600 hover:underline">â† Return to List</button>
            <h2 className="text-base font-semibold text-gray-900">Truckload: {selectedLoad.loadNumber}</h2>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Edit Pricing</button>
            <button className="px-4 py-1.5 text-xs font-medium border border-blue-600 text-blue-600 rounded hover:bg-blue-50">Edit Record</button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-0 mb-4">
          {['Quote', 'Committed', 'Dispatched', 'In Transit', 'Delivered'].map((s, i) => {
            const statuses = ['PENDING', 'CARRIER_ASSIGNED', 'POSTED_TO_DAT', 'IN_TRANSIT', 'DELIVERED'];
            const currentIdx = statuses.indexOf(selectedLoad.status);
            const isActive = i === currentIdx;
            const isPast = i < currentIdx;
            return (
              <div key={s} className="flex items-center">
                <span className={`text-xs px-4 py-1.5 font-medium ${isActive ? 'text-green-700 border-b-2 border-green-600' : isPast ? 'text-gray-400' : 'text-gray-400'}`}>
                  {s}
                </span>
                {i < 4 && <span className="text-gray-300 text-xs">â€º</span>}
              </div>
            );
          })}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
          {[
            { id: 'activity', label: 'Activity Log', badge: '3' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'alerts', label: 'Alerts' },
            { id: 'checkcall', label: 'Check Call' },
            { id: 'location', label: 'Location History' },
            { id: 'accounting', label: 'Accounting', hasDropdown: true },
            { id: 'tools', label: 'Tools', hasDropdown: true },
            { id: 'message', label: 'Send Message' },
            { id: 'documents', label: 'Documents', hasDropdown: true },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { if (tab.id === 'location') { setShowLocationHistory(true); } else { setDetailTab(tab.id); } }}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                detailTab === tab.id
                  ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.badge && <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.badge}</span>}
              {tab.hasDropdown && <span className="text-gray-400">â–¾</span>}
            </button>
          ))}
        </div>

        {/* 3-column detail â€” Activity Log tab */}
        {detailTab === 'activity' && (
        <div className="grid grid-cols-12 gap-4">
          {/* Left: Customer */}
          <div className="col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                <span>ðŸ¢</span> <span>End Customer</span>
              </div>
              <h3 className="text-base font-bold text-blue-600 mb-2">{selectedLoad.customer?.name?.toUpperCase()}</h3>
              <p className="text-xs text-gray-600">{selectedLoad.customer?.address || 'â€”'}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Credit Status:</span>
                  <span className="font-medium">Cash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Credit Limit:</span>
                  <span className="font-medium">â€”</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Total Due</span>
                  <span className="font-medium">${(selectedLoad.shipperRate || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Shipment details */}
          <div className="col-span-6 space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">ðŸ“‹</span>
                <h3 className="text-sm font-semibold text-gray-800">Shipment References</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-500 mb-1">Assigned Branch</p>
                  <p className="font-medium">GNY</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Carrier Rep</p>
                  <p className="font-medium">â€”</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Customer PO</p>
                  <p className="font-medium">â€”</p>
                </div>
              </div>
            </div>

            {/* First Pickup */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span>ðŸ </span>
                  <h3 className="text-sm font-semibold text-gray-800">First Pickup</h3>
                </div>
                <button className="text-xs text-blue-600 hover:underline">+ Add Stop</button>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-gray-800 mb-1">{pickup?.facilityName || 'No facility'}</p>
                <p className="text-gray-600">{pickup?.address}</p>
                <p className="text-gray-600">{pickup?.city}, {pickup?.state} {pickup?.zip}</p>
                {pickup?.instructions && (
                  <div className="mt-2">
                    <p className="text-gray-500 font-medium">Stop Instructions</p>
                    <p className="text-gray-700">{pickup.instructions}</p>
                  </div>
                )}
                <div className="mt-3 border-t border-gray-100 pt-2">
                  <p className="text-gray-500 font-medium mb-1">Pickup Information</p>
                  {pickup?.scheduledAt && (
                    <p>Pickup Ready: <span className="font-medium">{new Date(pickup.scheduledAt).toLocaleString()}</span></p>
                  )}
                </div>
              </div>
            </div>

            {/* Last Drop */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span>ðŸ </span>
                  <h3 className="text-sm font-semibold text-gray-800">Last Drop</h3>
                </div>
                <button className="text-xs text-blue-600 hover:underline">+ Add Stop</button>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-gray-800 mb-1">{delivery?.facilityName || 'No facility'}</p>
                <p className="text-gray-600">{delivery?.address}</p>
                <p className="text-gray-600">{delivery?.city}, {delivery?.state} {delivery?.zip}</p>
                {delivery?.instructions && (
                  <div className="mt-2">
                    <p className="text-gray-500 font-medium">Stop Instructions</p>
                    <p className="text-gray-700">{delivery.instructions}</p>
                  </div>
                )}
                <div className="mt-3 border-t border-gray-100 pt-2">
                  <p className="text-gray-500 font-medium mb-1">Delivery Information</p>
                  {delivery?.scheduledAt && (
                    <p>Delivery: <span className="font-medium">{new Date(delivery.scheduledAt).toLocaleString()}</span></p>
                  )}
                </div>
              </div>
            </div>

            {/* Cost Calculations */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">$ Cost Calculations</h3>

              <div className="border border-gray-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">ðŸš›</span>
                    <span className="text-sm font-semibold text-gray-700">Linehaul</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {selectedLoad.carrier?.name?.toUpperCase() || 'UNASSIGNED'}
                    </span>
                  </div>
                </div>

                {/* Assign carrier */}
                {!selectedLoad.carrier && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <p className="font-medium text-yellow-800 mb-2">No carrier assigned</p>
                    <div className="flex gap-2">
                      <select
                        value={assignCarrierId}
                        onChange={e => setAssignCarrierId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">Select carrier...</option>
                        {carriers?.filter((c: any) => c.status === 'ACTIVE').map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name} â€” {c.mcNumber}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={assignCarrierRate}
                        onChange={e => setAssignCarrierRate(e.target.value)}
                        placeholder="Rate $"
                        className="w-24 border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => assignMutation.mutate({ id: selectedLoad.id })}
                        disabled={!assignCarrierId || !assignCarrierRate || assignMutation.isPending}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 mb-1">Status</p>
                    <p className="font-medium">{STATUS_LABELS[selectedLoad.status]}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Tariff</p>
                    <p className="font-medium">No Tariff</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Bill To</p>
                    <p className="text-blue-600">AXON TMS</p>
                  </div>
                </div>

                {/* Pricing Knowledge Base */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <span className="text-gray-500 font-medium">ðŸ“Š Pricing</span>
                    <span className="text-right text-gray-500 font-medium">Buy</span>
                    <span className="text-right text-gray-500 font-medium">Sell</span>
                    <span className="text-right text-gray-500 font-medium">Margin</span>

                    <span className="text-gray-700">Linehaul</span>
                    <span className="text-right font-medium">${(selectedLoad.carrierRate || 0).toLocaleString()}</span>
                    <span className="text-right font-medium">${(selectedLoad.shipperRate || 0).toLocaleString()}</span>
                    <span className={`text-right font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${margin.toLocaleString()} ({marginPct}%)
                    </span>

                    <span className="text-gray-700">Fuel</span>
                    <span className="text-right">$0</span>
                    <span className="text-right">$0</span>
                    <span className="text-right text-gray-500">$0 (0%)</span>
                  </div>
                </div>
              </div>

              {/* Shipment Total */}
              <div className="border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-gray-800 mb-3">$ Shipment Total</h4>
                <div className="grid grid-cols-4 gap-2 text-xs border-t border-gray-200 pt-2">
                  <span className="col-span-1 text-gray-600">AXON TMS</span>
                  <span className="text-right text-gray-500">Buy</span>
                  <span className="text-right text-gray-500">Sell</span>
                  <span className="text-right text-gray-500">Margin</span>

                  <span className="text-gray-700 text-xs italic">Totals</span>
                  <span className="text-right font-bold">${(selectedLoad.carrierRate || 0).toLocaleString()}</span>
                  <span className="text-right font-bold">${(selectedLoad.shipperRate || 0).toLocaleString()}</span>
                  <span className={`text-right font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${margin.toLocaleString()} ({marginPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Alerts */}
          <div className="col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span>ðŸ””</span>
                <h3 className="text-sm font-semibold text-gray-800">Alerts</h3>
              </div>
              <p className="text-xs text-gray-400">No alerts for this shipment.</p>
            </div>
          </div>
        </div>
        )}

        {/* Documents tab */}
        {detailTab === 'documents' && (() => {
          const docs = MOCK_DOCS[selectedLoad.id] || [];
          const fmtDT3 = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
          return (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-900">Documents â€” {selectedLoad.loadNumber}</h3>
                  <span className="text-xs text-gray-400">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">ðŸ“¥ Download All</button>
                  <button onClick={() => setShowDocUpload(true)} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">+ Upload Document</button>
                </div>
              </div>

              {/* Required documents checklist */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['RATE_CON', 'BOL', 'POD', 'INVOICE'].map(type => {
                  const hasDoc = docs.some(d => d.type === type);
                  const info = DOC_LABELS[type];
                  return (
                    <div key={type} className={`rounded-lg p-3 border ${hasDoc ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{info.icon}</span>
                        <span className={`text-xs font-bold ${hasDoc ? 'text-green-600' : 'text-red-500'}`}>{hasDoc ? 'âœ“' : 'Missing'}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700">{info.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Documents table */}
              {docs.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500">Type</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500">File Name</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500">Uploaded By</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500">Date</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500">Size</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500">Status</th>
                      <th className="text-left px-3 py-2.5 font-medium text-gray-500">Actions</th>
                    </tr></thead>
                    <tbody>
                      {docs.map(doc => {
                        const info = DOC_LABELS[doc.type] || DOC_LABELS['OTHER'];
                        return (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2.5"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.color}`}>{info.icon} {info.label}</span></td>
                            <td className="px-3 py-2.5 text-blue-600 font-medium text-sm hover:underline cursor-pointer">{doc.name}</td>
                            <td className="px-3 py-2.5 text-gray-600 text-sm">{doc.uploadedBy}</td>
                            <td className="px-3 py-2.5 text-gray-500 text-sm whitespace-nowrap">{fmtDT3(doc.uploadedAt)}</td>
                            <td className="px-3 py-2.5 text-gray-500 text-sm">{doc.fileSize}</td>
                            <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DOC_STATUS_BADGE[doc.status]}`}>{doc.status}</span></td>
                            <td className="px-3 py-2.5 flex gap-1">
                              <button className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100">View</button>
                              <button className="px-2 py-1 text-xs text-gray-600 bg-gray-50 rounded hover:bg-gray-100">â¬‡</button>
                              {doc.status === 'RECEIVED' && <button className="px-2 py-1 text-xs text-green-600 bg-green-50 rounded hover:bg-green-100">Approve</button>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <div className="text-3xl mb-2">ðŸ“</div>
                  <p className="text-sm text-gray-600 font-medium">No documents uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload BOL, POD, rate confirmation, or other documents</p>
                </div>
              )}

              {/* Upload Modal */}
              {showDocUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDocUpload(false)}>
                  <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-sm font-semibold text-gray-900">Upload Document â€” {selectedLoad.loadNumber}</h2></div>
                    <div className="px-6 py-4 space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Select type...</option><option>Bill of Lading (BOL)</option><option>Proof of Delivery (POD)</option><option>Rate Confirmation</option><option>Carrier Packet</option><option>Invoice</option><option>Lumper Receipt</option><option>Scale Ticket</option><option>Insurance Certificate</option><option>Other</option></select></div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <div className="text-3xl mb-2">ðŸ“¤</div>
                        <p className="text-sm font-medium text-gray-700">Drag & drop files here</p>
                        <p className="text-xs text-gray-400 mt-1">or click to browse â€” PDF, JPG, PNG up to 10 MB</p>
                      </div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label><textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Any notes about this document..." /></div>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                      <button onClick={() => setShowDocUpload(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                      <button className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Upload</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Other tabs placeholder */}
        {!['activity', 'documents'].includes(detailTab) && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-2xl mb-2">ðŸ“‹</div>
            <p className="text-sm font-medium text-gray-600">{detailTab.charAt(0).toUpperCase() + detailTab.slice(1)}</p>
            <p className="text-xs text-gray-400 mt-1">Content for this tab</p>
          </div>
        )}

        {/* â”€â”€ Location History Modal (Trucker Tools) â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {showLocationHistory && (() => {
          const tracking = MOCK_TRACKING[selectedLoad.id];
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLocationHistory(false)}>
              <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Shipment Location History ({selectedLoad.loadNumber})</h2>
                  <button onClick={() => setShowLocationHistory(false)} className="text-gray-400 hover:text-gray-600 text-xl">Ã—</button>
                </div>

                {tracking ? (
                  <div className="flex divide-x divide-gray-200" style={{ height: '70vh' }}>
                    {/* Left: Map Placeholder */}
                    <div className="w-1/2 bg-gray-100 relative flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-3">ðŸ—º</div>
                        <p className="text-sm text-gray-500 font-medium">Map View</p>
                        <p className="text-xs text-gray-400 mt-1">Powered by Google Maps</p>
                        <p className="text-xs text-gray-400">Trucker Tools Integration</p>
                        <div className="mt-4 flex gap-2 justify-center">
                          <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded shadow-sm">Map</button>
                          <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded shadow-sm text-gray-400">Satellite</button>
                        </div>
                      </div>
                      {/* Location pin count */}
                      <div className="absolute bottom-3 left-3 bg-white rounded-lg shadow px-3 py-1.5 text-xs text-gray-600">
                        <span className="font-semibold text-blue-600">{tracking.pings.length}</span> location pings
                      </div>
                    </div>

                    {/* Right: Tracking Details + Location Table */}
                    <div className="w-1/2 flex flex-col overflow-hidden">
                      {/* Latest Update */}
                      <div className="p-5 border-b border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Latest Tracking Update:</h3>
                        <p className="text-sm font-semibold text-gray-800">{tracking.lastLocation}</p>
                        <p className="text-xs text-gray-500 mt-1">{tracking.lastUpdate} via <strong>{tracking.provider}</strong></p>
                        <button className="w-full mt-3 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700">Cancel Tracking</button>
                      </div>

                      {/* Delivery Location */}
                      <div className="px-5 py-3 border-b border-gray-200">
                        <p className="text-xs font-bold text-gray-700 mb-1">Delivery Location</p>
                        <p className="text-xs text-gray-600">{tracking.delivery}</p>
                      </div>

                      {/* Location Pings Table */}
                      <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-gray-50">
                            <tr className="border-b border-gray-200">
                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">â± Your Time</th>
                              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tracking.pings.map((p, i) => (
                              <tr key={i} className={`border-b border-gray-100 ${i === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{p.time}</td>
                                <td className="px-4 py-2.5 text-gray-800">{p.location}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">ðŸ“¡</div>
                    <p className="text-sm font-medium text-gray-600">No tracking data available</p>
                    <p className="text-xs text-gray-400 mt-2">Tracking is initiated when the carrier confirms via Trucker Tools</p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Request Tracking</button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div>
      {/* Create Shipment Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-base font-semibold">Create LTL Shipment</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">âœ•</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer *</label>
                  <select value={form.customerId} onChange={e => setF('customerId', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select customer</option>
                    {customers?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Commodity</label>
                  <input value={form.commodity} onChange={e => setF('commodity', e.target.value)} placeholder="FAK" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Shipper Rate (Sell $) *</label>
                  <input type="number" value={form.shipperRate} onChange={e => setF('shipperRate', e.target.value)} placeholder="700" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target Carrier Rate (Buy $)</label>
                  <input type="number" value={form.carrierRate} onChange={e => setF('carrierRate', e.target.value)} placeholder="650" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">ðŸ  Origin Information</p>
                  <div className="space-y-2">
                    <input value={form.pickupFacility} onChange={e => setF('pickupFacility', e.target.value)} placeholder="Company Name" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    <input value={form.pickupAddress} onChange={e => setF('pickupAddress', e.target.value)} placeholder="Street Address" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    <div className="grid grid-cols-3 gap-1">
                      <input value={form.pickupCity} onChange={e => setF('pickupCity', e.target.value)} placeholder="City" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                      <input value={form.pickupState} onChange={e => setF('pickupState', e.target.value)} placeholder="ST" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                      <input value={form.pickupZip} onChange={e => setF('pickupZip', e.target.value)} placeholder="ZIP" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    </div>
                    <input type="datetime-local" value={form.pickupDate} onChange={e => setF('pickupDate', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">ðŸ  Destination Information</p>
                  <div className="space-y-2">
                    <input value={form.deliveryFacility} onChange={e => setF('deliveryFacility', e.target.value)} placeholder="Company Name" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    <input value={form.deliveryAddress} onChange={e => setF('deliveryAddress', e.target.value)} placeholder="Street Address" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    <div className="grid grid-cols-3 gap-1">
                      <input value={form.deliveryCity} onChange={e => setF('deliveryCity', e.target.value)} placeholder="City" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                      <input value={form.deliveryState} onChange={e => setF('deliveryState', e.target.value)} placeholder="ST" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                      <input value={form.deliveryZip} onChange={e => setF('deliveryZip', e.target.value)} placeholder="ZIP" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                    </div>
                    <input type="datetime-local" value={form.deliveryDate} onChange={e => setF('deliveryDate', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.customerId || !form.shipperRate}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Save & View Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Shipment Search</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Add New Shipment
        </button>
      </div>

      {/* Search filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Carrier</label>
            <input placeholder="type to search carriers..." className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Shipment IDs</label>
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search..."
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Shipment Type</label>
            <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-600">
              <option>-- All --</option>
              <option>Truckload</option>
              <option>LTL</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Customer</label>
            <input placeholder="type to search customers..." className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-600">
              <option value="All">-- Select --</option>
              <option value="PENDING">Pending</option>
              <option value="CARRIER_ASSIGNED">Committed</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Assignments</label>
            <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-600">
              <option>-- Select --</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50">Export to Excel</button>
          <button onClick={() => { setStatusFilter('All'); setSearchText(''); }} className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50">Clear Fields</button>
          <button className="px-6 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Search</button>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="w-8 px-3 py-2.5">
                  <input type="checkbox" className="w-3 h-3" />
                </th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Shipment Id â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Customer Name â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Ship Date â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Delivery Date â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">From City â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">From State â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">To City â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">To State â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Carrier Name â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Status â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Last Ops Update â†•</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Margin</th>
                <th className="text-left px-3 py-2.5 font-medium whitespace-nowrap">Load Boards</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={14} className="px-3 py-8 text-center text-gray-400">Loading shipments...</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={14} className="px-3 py-8 text-center text-gray-400">No shipments found.</td></tr>
              )}
              {filtered.map((load: any, i: number) => {
                const pickup = load.stops?.[0];
                const delivery = load.stops?.[load.stops?.length - 1];
                const margin = (load.shipperRate || 0) - (load.carrierRate || 0);
                const createdAt = load.createdAt ? new Date(load.createdAt) : null;
                const now = new Date();
                const minutesAgo = createdAt ? Math.floor((now.getTime() - createdAt.getTime()) / 60000) : null;
                const timeAgo = minutesAgo !== null
                  ? minutesAgo < 60 ? `${minutesAgo} minutes ago`
                  : minutesAgo < 1440 ? `${Math.floor(minutesAgo / 60)} hours ago`
                  : `${Math.floor(minutesAgo / 1440)} days ago`
                  : 'â€”';

                return (
                  <tr key={load.id} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-2">
                      <input type="checkbox" className="w-3 h-3" />
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => setSelectedId(load.id)} className="text-blue-600 hover:underline font-medium">
                        {load.loadNumber}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{load.customer?.name}</td>
                    <td className="px-3 py-2 text-gray-600">{pickup?.scheduledAt ? new Date(pickup.scheduledAt).toLocaleDateString() : 'â€”'}</td>
                    <td className="px-3 py-2 text-gray-600">{delivery?.scheduledAt ? new Date(delivery.scheduledAt).toLocaleDateString() : 'â€”'}</td>
                    <td className="px-3 py-2 text-gray-700 uppercase">{pickup?.city || 'â€”'}</td>
                    <td className="px-3 py-2 text-gray-700 uppercase">{pickup?.state || 'â€”'}</td>
                    <td className="px-3 py-2 text-gray-700 uppercase">{delivery?.city || 'â€”'}</td>
                    <td className="px-3 py-2 text-gray-700 uppercase">{delivery?.state || 'â€”'}</td>
                    <td className="px-3 py-2">
                      {load.carrier
                        ? <span className="text-blue-600">ðŸš› {load.carrier.name}</span>
                        : <span className="text-gray-400">â€”</span>
                      }
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-white text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[load.status] || 'bg-gray-400'}`}>
                        {STATUS_LABELS[load.status] || load.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{timeAgo}</td>
                    <td className="px-3 py-2">
                      <span className={`font-medium ${margin > 0 ? 'text-green-600' : margin < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {load.carrierRate ? `$${margin.toLocaleString()}` : 'â€”'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {(() => {
                        const postings = MOCK_POSTINGS[load.id];
                        if (postings && postings.length > 0) {
                          return (
                            <div className="flex items-center gap-1">
                              {postings.map(p => (
                                <span key={p.board} className={`px-1.5 py-0.5 rounded text-xs font-bold ${p.board === 'DAT' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`} title={`${p.views} views, ${p.contacts} contacts`}>{p.board === 'DAT' ? 'DAT' : 'TS'}</span>
                              ))}
                              <span className="text-xs text-gray-400 ml-1">{postings.reduce((s, p) => s + p.views, 0)} views</span>
                            </div>
                          );
                        }
                        if (!load.carrier && ['PENDING', 'POSTED_TO_DAT'].includes(load.status)) {
                          return <div className="flex gap-1"><button onClick={e => { e.stopPropagation(); setMatchLoadId(load.id); setShowCarrierMatch(true); }} className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-50 rounded hover:bg-green-100">Match</button><button onClick={e => { e.stopPropagation(); setPostingLoadId(load.id); setShowPostModal(true); }} className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Post</button></div>;
                        }
                        return <span className="text-xs text-gray-300">â€”</span>;
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500">
          Showing {filtered.length} of {allLoads.length} shipments
        </div>
      </div>

      {/* â”€â”€ Post to Load Board Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showPostModal && (() => {
        const postLoad = allLoads.find((l: any) => l.id === postingLoadId);
        if (!postLoad) return null;
        const pickup = postLoad.stops?.[0];
        const delivery = postLoad.stops?.[postLoad.stops?.length - 1];
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPostModal(false)}>
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Post to Load Boards â€” {postLoad.loadNumber}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{pickup?.city}, {pickup?.state} â†’ {delivery?.city}, {delivery?.state}</p>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* Load Summary */}
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-gray-400">Equipment</span><br/><strong>{postLoad.commodity?.includes('Reefer') || postLoad.commodity?.includes('Refrigerated') ? 'Reefer' : postLoad.commodity?.includes('Flatbed') ? 'Flatbed' : 'Dry Van'}</strong></div>
                  <div><span className="text-gray-400">Weight</span><br/><strong>{(postLoad.weight || 0).toLocaleString()} lbs</strong></div>
                  <div><span className="text-gray-400">Rate</span><br/><strong className="text-green-600">${(postLoad.shipperRate || 0).toLocaleString()}</strong></div>
                  <div><span className="text-gray-400">Pickup</span><br/><strong>{pickup?.scheduledAt ? new Date(pickup.scheduledAt).toLocaleDateString() : 'â€”'}</strong></div>
                  <div><span className="text-gray-400">Delivery</span><br/><strong>{delivery?.scheduledAt ? new Date(delivery.scheduledAt).toLocaleDateString() : 'â€”'}</strong></div>
                  <div><span className="text-gray-400">Miles</span><br/><strong>â€”</strong></div>
                </div>

                {/* Select Load Boards */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Select Load Boards</p>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${postBoards.dat ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={postBoards.dat} onChange={e => setPostBoards(p => ({ ...p, dat: e.target.checked }))} className="w-4 h-4 rounded text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">DAT</span><span className="text-sm font-medium text-gray-800">DAT One</span></div>
                        <p className="text-xs text-gray-400 mt-0.5">Post to DAT load board â€” largest carrier network</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${postBoards.truckstop ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={postBoards.truckstop} onChange={e => setPostBoards(p => ({ ...p, truckstop: e.target.checked }))} className="w-4 h-4 rounded text-orange-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">TS</span><span className="text-sm font-medium text-gray-800">Truckstop.com</span></div>
                        <p className="text-xs text-gray-400 mt-0.5">Post to Truckstop load board â€” direct carrier matching</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
                    </label>
                  </div>
                </div>

                {/* Posting Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posting Rate</label>
                    <input type="number" defaultValue={postLoad.shipperRate} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    <p className="text-xs text-gray-400 mt-1">Rate visible to carriers on load board</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Dry Van</option><option>Reefer</option><option>Flatbed</option><option>Step Deck</option><option>Power Only</option>
                    </select>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Auto-remove posting when carrier is assigned</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-blue-600" /> Send Trucker Tools tracking link to booked carrier</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded text-blue-600" /> Post as "All-In" rate (includes fuel surcharge)</label>
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <button onClick={() => setShowPostModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                <button onClick={() => setShowPostModal(false)} disabled={!postBoards.dat && !postBoards.truckstop} className={`px-6 py-2 text-sm font-semibold text-white rounded-lg ${postBoards.dat || postBoards.truckstop ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'}`}>
                  Post to {[postBoards.dat && 'DAT', postBoards.truckstop && 'Truckstop'].filter(Boolean).join(' + ') || 'Select a board'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* â”€â”€ Automated Carrier Matching Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showCarrierMatch && (() => {
        const matchLoad = allLoads.find((l: any) => l.id === matchLoadId);
        if (!matchLoad) return null;
        const pickup = matchLoad.stops?.[0];
        const delivery = matchLoad.stops?.[matchLoad.stops?.length - 1];
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCarrierMatch(false)}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Carrier Match â€” {matchLoad.loadNumber}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{pickup?.city}, {pickup?.state} â†’ {delivery?.city}, {delivery?.state} Â· ${matchLoad.shipperRate?.toLocaleString()}</p>
              </div>
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-gray-700 mb-3">Recommended Carriers (ranked by score)</p>
                <div className="space-y-2">
                  {[
                    { name: 'Eagle Freight Lines', mc: 'MC-123456', score: 96, onTime: 98, loads: 24, avgRate: 2150, lastRate: 2200, insurance: 'Current', safety: 'Satisfactory', reason: 'Top performer on this lane â€” 24 loads, 98% on-time' },
                    { name: 'Midwest Express Trucking', mc: 'MC-234567', score: 91, onTime: 94, loads: 18, avgRate: 2050, lastRate: 2100, insurance: 'Current', safety: 'Satisfactory', reason: 'Consistent on similar lanes â€” competitive rates' },
                    { name: 'Thunder Road Inc.', mc: 'MC-445566', score: 87, onTime: 92, loads: 12, avgRate: 1950, lastRate: 2000, insurance: 'Current', safety: 'Satisfactory', reason: 'Good capacity â€” 3 trucks in origin area' },
                    { name: 'Arctic Cold Carriers', mc: 'MC-554321', score: 84, onTime: 90, loads: 8, avgRate: 2300, lastRate: 2400, insurance: 'Current', safety: 'Satisfactory', reason: 'Reefer specialist â€” higher rates but reliable' },
                    { name: 'Lone Star Logistics', mc: 'MC-667788', score: 72, onTime: 85, loads: 5, avgRate: 1850, lastRate: 1900, insurance: 'Expiring', safety: 'Conditional', reason: 'Lower cost but conditional safety â€” review before booking' },
                  ].map((c, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${i === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'} hover:shadow-sm`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${c.score >= 90 ? 'bg-green-600 text-white' : c.score >= 80 ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-white'}`}>{c.score}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className="text-sm font-bold text-gray-900">{c.name}</span><span className="text-xs text-gray-400 font-mono">{c.mc}</span>{i === 0 && <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Best Match</span>}</div>
                        <p className="text-xs text-gray-500 mt-0.5">{c.reason}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span>On-time: <strong className={c.onTime >= 95 ? 'text-green-600' : c.onTime >= 90 ? 'text-blue-600' : 'text-yellow-600'}>{c.onTime}%</strong></span>
                          <span>Loads: <strong>{c.loads}</strong></span>
                          <span>Avg Rate: <strong>${c.avgRate.toLocaleString()}</strong></span>
                          <span>Last Rate: <strong>${c.lastRate.toLocaleString()}</strong></span>
                          <span>Insurance: <strong className={c.insurance === 'Current' ? 'text-green-600' : 'text-red-600'}>{c.insurance}</strong></span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Book</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <button onClick={() => setShowCarrierMatch(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                <button onClick={() => { setShowCarrierMatch(false); setPostingLoadId(matchLoadId); setShowPostModal(true); }} className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">Post to Load Boards Instead</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
