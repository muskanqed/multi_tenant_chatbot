"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { MessageSquare, Clock, TrendingUp, Users } from "lucide-react";

interface TenantStatsProps {
  tenantId: string;
}

interface Stats {
  totalMessages: number;
  avgResponseTime: number;
  activeUsers: number;
  satisfactionRate: number;
}

export default function TenantStats({ tenantId }: TenantStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    avgResponseTime: 0,
    activeUsers: 0,
    satisfactionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats/${tenantId}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tenantId]);

  const statCards = [
    {
      title: "Total Messages",
      value: stats.totalMessages.toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      title: "Avg Response Time",
      value: `${stats.avgResponseTime}s`,
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Satisfaction Rate",
      value: `${stats.satisfactionRate}%`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <Icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
