import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Plus,
  Download,
  Eye,
  Mail,
  MessageSquare,
  Loader2,
  CalendarDays,
  DollarSign,
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  Phone,
  MapPin,
  CreditCard,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { Separator } from "components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "components/ui/dialog";
import { Alert, AlertDescription } from "components/ui/alert";
import {
  getAdminBookings,
  updateBookingStatus,
  resendBookingEmail,
  resendBookingSms,
  cancelBooking,
} from "lib/api";
import type { Booking } from "@/types/booking";

function statusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
    case "completed":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    case "in_progress":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

function paymentBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    case "refunded":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Refunded</Badge>;
    default:
      return <Badge variant="outline">Unpaid</Badge>;
  }
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    const result = await getAdminBookings();
    if (result.ok && result.data) {
      setBookings(result.data.bookings || []);
    } else {
      setError(result.error || "Failed to load bookings");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchBookings();
      setLoading(false);
    })();
  }, [fetchBookings]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }

  // Filtered bookings
  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.booking_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    revenue: bookings
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
  };

  // Actions
  async function handleStatusUpdate(id: string, newStatus: string) {
    setActionLoading(`status-${id}`);
    const result = await updateBookingStatus(id, newStatus);
    if (result.ok) {
      await fetchBookings();
    }
    setActionLoading(null);
    setSelectedBooking(null);
  }

  async function handleResendEmail(id: string) {
    setActionLoading(`email-${id}`);
    await resendBookingEmail(id);
    setActionLoading(null);
  }

  async function handleResendSms(id: string) {
    setActionLoading(`sms-${id}`);
    await resendBookingSms(id);
    setActionLoading(null);
  }

  async function handleCancel(id: string) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(`cancel-${id}`);
    await cancelBooking(id);
    await fetchBookings();
    setActionLoading(null);
    setSelectedBooking(null);
  }

  function exportCSV() {
    const headers = ["Ref", "Name", "Email", "Phone", "Pickup", "Dropoff", "Date", "Time", "Passengers", "Total", "Status", "Payment"];
    const rows = filtered.map((b) => [
      b.booking_ref, b.name, b.email, b.phone, b.pickupAddress, b.dropoffAddress,
      b.date, b.time, b.passengers, b.totalPrice, b.status, b.payment_status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFFBEB] rounded-lg">
                <DollarSign className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.revenue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ref, name, email, phone..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button asChild size="sm" className="bg-[#D4AF37] hover:bg-[#C4A030]">
                <Link to="/admin/create-booking">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Route</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "No bookings match your filters"
                        : "No bookings yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => (
                    <TableRow
                      key={b.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <TableCell className="font-mono font-bold text-[#D4AF37]">
                        {b.booking_ref}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{b.name}</p>
                          <p className="text-xs text-muted-foreground">{b.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="max-w-xs">
                          <p className="text-xs text-muted-foreground truncate">{b.pickupAddress}</p>
                          <p className="text-xs text-muted-foreground truncate">{b.dropoffAddress}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{b.date}</p>
                        <p className="text-xs text-muted-foreground">{b.time}</p>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${b.totalPrice?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {statusBadge(b.status)}
                          {paymentBadge(b.payment_status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Booking {selectedBooking.booking_ref}
                  {statusBadge(selectedBooking.status)}
                </DialogTitle>
                <DialogDescription>
                  Created: {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString("en-NZ") : "Unknown"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Customer */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Customer</h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedBooking.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedBooking.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedBooking.phone}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Trip */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Trip</h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                      <span>{selectedBooking.pickupAddress}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-red-600 mt-0.5 shrink-0" />
                      <span>{selectedBooking.dropoffAddress}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedBooking.date} at {selectedBooking.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedBooking.passengers} passenger(s)
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Payment */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Payment</span>
                    {paymentBadge(selectedBooking.payment_status)}
                  </div>
                  <span className="text-lg font-bold text-[#D4AF37]">
                    ${selectedBooking.totalPrice?.toFixed(2)}
                  </span>
                </div>

                {selectedBooking.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Notes</h4>
                      <p className="text-sm">{selectedBooking.notes}</p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Actions</h4>

                  {/* Status Update */}
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.status !== "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === `status-${selectedBooking.id}`}
                        onClick={() => handleStatusUpdate(selectedBooking.id, "confirmed")}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Confirm
                      </Button>
                    )}
                    {selectedBooking.status !== "completed" && selectedBooking.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === `status-${selectedBooking.id}`}
                        onClick={() => handleStatusUpdate(selectedBooking.id, "completed")}
                      >
                        Complete
                      </Button>
                    )}
                    {selectedBooking.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        disabled={actionLoading === `cancel-${selectedBooking.id}`}
                        onClick={() => handleCancel(selectedBooking.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading === `email-${selectedBooking.id}`}
                      onClick={() => handleResendEmail(selectedBooking.id)}
                    >
                      {actionLoading === `email-${selectedBooking.id}` ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 mr-1" />
                      )}
                      Resend Email
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading === `sms-${selectedBooking.id}`}
                      onClick={() => handleResendSms(selectedBooking.id)}
                    >
                      {actionLoading === `sms-${selectedBooking.id}` ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      )}
                      Resend SMS
                    </Button>
                  </div>

                  {/* Edit Link */}
                  <Link
                    to={`/admin/edit-booking/${selectedBooking.id}`}
                    className="inline-flex items-center text-sm text-[#D4AF37] hover:text-[#C4A030] font-medium"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Edit Full Details →
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
