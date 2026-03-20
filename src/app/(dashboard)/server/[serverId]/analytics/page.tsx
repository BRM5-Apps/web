"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useAnalyticsDashboard,
  useAnalyticsEvents,
  useTopEvents,
} from "@/hooks/use-analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Users, MousePointer, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const COLORS = ["#5865F2", "#57F287", "#EB459E", "#FEE75C", "#FF73FA"];

export default function AnalyticsPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({ days: 7 });

  const { data: dashboard, isLoading: dashboardLoading } = useAnalyticsDashboard(serverId);
  const { data: events, isLoading: eventsLoading } = useAnalyticsEvents(serverId, { limit: 100 });
  const { data: topEvents, isLoading: topEventsLoading } = useTopEvents(serverId);

  if (dashboardLoading || eventsLoading || topEventsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const eventTypeData = dashboard?.eventsByType
    ? Object.entries(dashboard.eventsByType).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track events, user activity, and system metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalEvents?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All time events tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.uniqueUsers?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(dashboard?.eventsByType || {}).length}</div>
            <p className="text-xs text-muted-foreground">Different event types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Event</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {dashboard?.topEvents?.[0]?.eventType || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.topEvents?.[0]?.count?.toLocaleString() || 0} events
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="top">Top Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Events by Type</CardTitle>
                <CardDescription>Distribution of events across different types</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Events</CardTitle>
                <CardDescription>Most frequently triggered events</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEvents || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="eventType" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#5865F2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest tracked events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events?.slice(0, 20).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{event.eventType}</span>
                        <span className="text-sm text-muted-foreground">{event.category}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.createdAt))} ago
                    </span>
                  </div>
                ))}
                {(!events || events.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No events tracked yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top Events</CardTitle>
              <CardDescription>Most frequently triggered events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topEvents?.map((event, index) => (
                  <div
                    key={event.eventType}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold w-8">#{index + 1}</span>
                      <span className="font-medium">{event.eventType}</span>
                    </div>
                    <span className="text-sm font-medium">{event.count.toLocaleString()} events</span>
                  </div>
                ))}
                {(!topEvents || topEvents.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">No events tracked yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
