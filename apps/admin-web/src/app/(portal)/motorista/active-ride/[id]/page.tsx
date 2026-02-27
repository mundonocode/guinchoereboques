import { ActiveRideClient } from "./ActiveRideClient";

export default async function ActiveRidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ActiveRideClient rideId={id} />;
}
