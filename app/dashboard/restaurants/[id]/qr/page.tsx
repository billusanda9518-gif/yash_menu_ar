"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Download,
  Plus,
  Trash2,
  QrCode,
  Palette,
  Table2,
  FolderOpen,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { QRGenerator } from "@/components/dashboard/qr-generator";
import { PrintTableTents } from "@/components/dashboard/print-table-tents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { Restaurant, MenuCategory, Table, Branch } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Tab = "restaurant" | "tables" | "categories";

type Props = { params: Promise<{ id: string }> };

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function QRCodePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  /* Data state */
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  /* UI state */
  const [activeTab, setActiveTab] = useState<Tab>("restaurant");
  const [fgColor, setFgColor] = useState("#1a1a1a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [newTableNumber, setNewTableNumber] = useState("");
  const [addingTable, setAddingTable] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const [restRes, catRes, branchRes] = await Promise.all([
          supabase.from("restaurants").select("*").eq("id", id).single(),
          supabase
            .from("menu_categories")
            .select("*")
            .eq("restaurant_id", id)
            .eq("is_active", true)
            .order("sort_order"),
          supabase
            .from("branches")
            .select("*")
            .eq("restaurant_id", id)
            .order("created_at"),
        ]);

        if (restRes.error) throw restRes.error;

        setRestaurant(restRes.data);
        setCategories(catRes.data || []);
        setBranches(branchRes.data || []);

        /* Fetch tables for all branches */
        const branchIds = (branchRes.data || []).map((b: Branch) => b.id);
        if (branchIds.length > 0) {
          const tableRes = await supabase
            .from("tables")
            .select("*")
            .in("branch_id", branchIds)
            .eq("is_active", true)
            .order("table_number");
          setTables(tableRes.data || []);
        }
      } catch {
        showToast.error("Restaurant not found");
        router.push("/dashboard/restaurants");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  /* ---------------------------------------------------------------- */
  /*  Add table handler                                                */
  /* ---------------------------------------------------------------- */

  const handleAddTable = useCallback(async () => {
    if (!newTableNumber.trim() || !restaurant) return;

    setAddingTable(true);
    try {
      const supabase = createClient();
      let branchId: string;

      if (branches.length === 0) {
        /* Create a default branch if none exists */
        const branchRes = await supabase
          .from("branches")
          .insert({
            restaurant_id: restaurant.id,
            name: "Main",
            address: restaurant.address || "Default",
            is_active: true,
          })
          .select()
          .single();

        if (branchRes.error) throw branchRes.error;
        branchId = branchRes.data.id;
        setBranches((prev) => [...prev, branchRes.data]);
      } else {
        branchId = branches[0].id;
      }

      const tableRes = await supabase
        .from("tables")
        .insert({
          branch_id: branchId,
          table_number: newTableNumber.trim(),
          is_active: true,
        })
        .select()
        .single();

      if (tableRes.error) throw tableRes.error;

      setTables((prev) => [...prev, tableRes.data]);
      setNewTableNumber("");
      showToast.success(`Table ${newTableNumber.trim()} added`);
    } catch {
      showToast.error("Failed to add table");
    } finally {
      setAddingTable(false);
    }
  }, [newTableNumber, restaurant, branches]);

  /* ---------------------------------------------------------------- */
  /*  Delete table handler                                             */
  /* ---------------------------------------------------------------- */

  const handleDeleteTable = useCallback(async (tableId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tables")
        .update({ is_active: false })
        .eq("id", tableId);

      if (error) throw error;

      setTables((prev) => prev.filter((t) => t.id !== tableId));
      showToast.success("Table removed");
    } catch {
      showToast.error("Failed to remove table");
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Bulk download helpers                                            */
  /* ---------------------------------------------------------------- */

  const bulkDownloadTableQRs = useCallback(async () => {
    if (!restaurant || tables.length === 0) return;

    setBulkDownloading(true);
    try {
      const origin = window.location.origin;
      for (const table of tables) {
        const url = `${origin}/menu/${restaurant.slug}?table=${encodeURIComponent(table.table_number)}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: "M",
        });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `table-${table.table_number}-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        /* Small delay to avoid browser blocking downloads */
        await new Promise((r) => setTimeout(r, 200));
      }
      showToast.success(`Downloaded ${tables.length} QR codes`);
    } catch {
      showToast.error("Failed to download QR codes");
    } finally {
      setBulkDownloading(false);
    }
  }, [restaurant, tables, fgColor, bgColor]);

  const bulkDownloadCategoryQRs = useCallback(async () => {
    if (!restaurant || categories.length === 0) return;

    setBulkDownloading(true);
    try {
      const origin = window.location.origin;
      for (const cat of categories) {
        const url = `${origin}/menu/${restaurant.slug}?category=${cat.slug}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: "M",
        });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `category-${cat.slug}-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await new Promise((r) => setTimeout(r, 200));
      }
      showToast.success(`Downloaded ${categories.length} QR codes`);
    } catch {
      showToast.error("Failed to download QR codes");
    } finally {
      setBulkDownloading(false);
    }
  }, [restaurant, categories, fgColor, bgColor]);

  /* ---------------------------------------------------------------- */
  /*  Loading / empty state                                            */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

  if (!restaurant) return null;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const menuUrl = `${origin}/menu/${restaurant.slug}`;

  /* ---------------------------------------------------------------- */
  /*  Tab definitions                                                  */
  /* ---------------------------------------------------------------- */

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "restaurant", label: "Restaurant QR", icon: QrCode },
    { key: "tables", label: "Table QRs", icon: Table2 },
    { key: "categories", label: "Category QRs", icon: FolderOpen },
  ];

  return (
    <>
      <DashboardHeader
        title="QR Codes"
        description={restaurant.name}
        onMenuToggle={() => {}}
      >
        <Link href={`/dashboard/restaurants/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </DashboardHeader>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8 print:hidden">
        {/* ── Tab bar ──────────────────────────────────────────── */}
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-orange-500/15 text-orange-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Color customization ──────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <Palette className="h-4 w-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">QR Colors:</span>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            Foreground
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            Background
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
            />
          </label>
          <button
            onClick={() => {
              setFgColor("#1a1a1a");
              setBgColor("#ffffff");
            }}
            className="text-xs text-zinc-500 hover:text-orange-400 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* ── RESTAURANT QR TAB ────────────────────────────────── */}
        {activeTab === "restaurant" && (
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <QRGenerator
                url={menuUrl}
                label={restaurant.name}
                sublabel="Full menu QR code"
                fgColor={fgColor}
                bgColor={bgColor}
                size={300}
              />
            </div>
          </div>
        )}

        {/* ── TABLE QRS TAB ────────────────────────────────────── */}
        {activeTab === "tables" && (
          <div className="space-y-6">
            {/* Add table form */}
            <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  label="Add Table"
                  placeholder="Table number or name (e.g. 1, A1, Patio-3)"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTable();
                  }}
                />
              </div>
              <Button
                onClick={handleAddTable}
                loading={addingTable}
                disabled={!newTableNumber.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </div>

            {/* Bulk actions */}
            {tables.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkDownloadTableQRs}
                  loading={bulkDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All PNGs ({tables.length})
                </Button>
                <PrintTableTents
                  restaurant={{ name: restaurant.name, slug: restaurant.slug }}
                  tables={tables.map((t) => ({
                    table_number: t.table_number,
                  }))}
                />
                <Badge variant="secondary">
                  {tables.length} table{tables.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            )}

            {/* Table list */}
            {tables.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
                <Table2 className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-400">
                  No tables yet. Add your first table above.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tables.map((table) => (
                  <TableQRCard
                    key={table.id}
                    table={table}
                    restaurantSlug={restaurant.slug}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    onDelete={handleDeleteTable}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORY QRS TAB ────────────────────────────────── */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Bulk download */}
            {categories.length > 0 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkDownloadCategoryQRs}
                  loading={bulkDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All PNGs ({categories.length})
                </Button>
                <Badge variant="secondary">
                  {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
                </Badge>
              </div>
            )}

            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
                <FolderOpen className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-400">
                  No categories yet. Add categories in the Categories section.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <QRGenerator
                    key={cat.id}
                    url={`${origin}/menu/${restaurant.slug}?category=${cat.slug}`}
                    label={cat.name}
                    sublabel={`/${cat.slug}`}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    size={200}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden print area — lives outside the print:hidden wrapper */}
      {activeTab === "tables" && tables.length > 0 && (
        <div className="hidden print:block">
          <PrintTableTentsInline
            restaurant={{ name: restaurant.name, slug: restaurant.slug }}
            tables={tables.map((t) => ({ table_number: t.table_number }))}
          />
        </div>
      )}
    </>
  );
}

/* ================================================================== */
/*  TableQRCard — sub-component for individual table row               */
/* ================================================================== */

function TableQRCard({
  table,
  restaurantSlug,
  fgColor,
  bgColor,
  onDelete,
}: {
  table: Table;
  restaurantSlug: string;
  fgColor: string;
  bgColor: string;
  onDelete: (id: string) => void;
}) {
  const [qrSrc, setQrSrc] = useState("");

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/menu/${restaurantSlug}?table=${encodeURIComponent(table.table_number)}`;

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 120,
      margin: 1,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: "M",
    }).then((data) => {
      if (!cancelled) setQrSrc(data);
    });
    return () => {
      cancelled = true;
    };
  }, [url, fgColor, bgColor]);

  const handleDownload = useCallback(async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: "M",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `table-${table.table_number}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast.success(`Downloaded QR for Table ${table.table_number}`);
    } catch {
      showToast.error("Download failed");
    }
  }, [url, fgColor, bgColor, table.table_number]);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      {/* QR thumbnail */}
      <div className="shrink-0 rounded-lg bg-white p-1.5">
        {qrSrc ? (
          <img
            src={qrSrc}
            alt={`QR for Table ${table.table_number}`}
            width={64}
            height={64}
            className="block"
          />
        ) : (
          <div className="h-16 w-16 bg-zinc-100" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">
          Table {table.table_number}
        </p>
        <p className="truncate text-xs text-zinc-500">
          ?table={table.table_number}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(table.id)}
          className="text-zinc-400 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PrintTableTentsInline — inline print layout (no portal)            */
/* ================================================================== */

function PrintTableTentsInline({
  restaurant,
  tables,
}: {
  restaurant: { name: string; slug: string };
  tables: Array<{ table_number: string }>;
}) {
  const [cards, setCards] = useState<
    Array<{ tableNumber: string; qrDataUrl: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const results: Array<{ tableNumber: string; qrDataUrl: string }> = [];

      for (const table of tables) {
        const url = `${origin}/menu/${restaurant.slug}?table=${encodeURIComponent(table.table_number)}`;
        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 200,
            margin: 2,
            color: { dark: "#1a1a1a", light: "#ffffff" },
            errorCorrectionLevel: "M",
          });
          results.push({
            tableNumber: table.table_number,
            qrDataUrl: dataUrl,
          });
        } catch {
          /* skip */
        }
      }

      if (!cancelled) setCards(results);
    }

    if (tables.length > 0) generate();
    return () => {
      cancelled = true;
    };
  }, [tables, restaurant.slug]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "24px",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.tableNumber}
          style={{
            border: "2px dashed #d4d4d8",
            borderRadius: "12px",
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pageBreakInside: "avoid",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#18181b",
              marginBottom: "16px",
            }}
          >
            {restaurant.name}
          </h2>
          <img
            src={card.qrDataUrl}
            alt={`Table ${card.tableNumber}`}
            width={180}
            height={180}
            style={{ display: "block", marginBottom: "16px" }}
          />
          <p
            style={{
              fontSize: "14px",
              color: "#52525b",
              marginBottom: "8px",
            }}
          >
            Scan to view our menu
          </p>
          <p
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#18181b",
              padding: "6px 16px",
              backgroundColor: "#f4f4f5",
              borderRadius: "8px",
            }}
          >
            Table {card.tableNumber}
          </p>
        </div>
      ))}
    </div>
  );
}
