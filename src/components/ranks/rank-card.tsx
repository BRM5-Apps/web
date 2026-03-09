import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RankCardProps {
  name: string;
  level: number;
  color?: string;
  memberCount?: number;
}

export function RankCard({ name, level, color, memberCount }: RankCardProps) {
  return (
    <Card className="card-interactive">
      <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
        {color && (
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        )}
        <CardTitle className="text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Level {level}</p>
        {memberCount !== undefined && (
          <p className="text-sm text-muted-foreground">{memberCount} members</p>
        )}
      </CardContent>
    </Card>
  );
}
