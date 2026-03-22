import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventCardProps {
  title: string;
  status: string;
  scheduledStart?: string;
  hostName?: string;
}

export function EventCard({ title, status, scheduledStart, hostName }: EventCardProps) {
  return (
    <Card className="card-interactive">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground">Status: {status}</p>
        {scheduledStart && (
          <p className="text-sm text-muted-foreground">Starts: {scheduledStart}</p>
        )}
        {hostName && (
          <p className="text-sm text-muted-foreground">Host: {hostName}</p>
        )}
      </CardContent>
    </Card>
  );
}
