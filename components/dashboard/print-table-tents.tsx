"use client";

import { useEffect, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PrintTableTentsProps {
  restaurant: { name: string; slug: string };
  tables: Array<{ table_number: string }>;
}

interface TentCard {
  tableNumber: string;
  qrDataUrl: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PrintTableTents({ restaurant, tables }: PrintTableTentsProps) {
  const [cards, setCards] = useState<TentCard[]>([]);
  const [generating, setGenerating] = useState(false);

  /* Generate QR data URLs for all tables */
  useEffect(() => {
    let cancelled = false;

    async function generate() {
      setGenerating(true);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const results: TentCard[] = [];

      for (const table of tables) {
        const url = `${origin}/menu/${restaurant.slug}?table=${encodeURIComponent(table.table_number)}`;
        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 200,
            margin: 2,
            color: { dark: "#1a1a1a", light: "#ffffff" },
            errorCorrectionLevel: "M",
          });
          results.push({ tableNumber: table.table_number, qrDataUrl: dataUrl });
        } catch {
          /* skip failed QR */
        }
      }

      if (!cancelled) {
        setCards(results);
        setGenerating(false);
      }
    }

    if (tables.length > 0) {
      generate();
    }

    return () => {
      cancelled = true;
    };
  }, [tables, restaurant.slug]);

  /* Trigger print dialog */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (tables.length === 0) return null;

  return (
    <>
      {/* Print button — hidden during print */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        loading={generating}
        className="print:hidden"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Table Tents
      </Button>

      {/* Printable tent cards — hidden on screen, shown during print */}
      <div className="hidden print:block">
        <style>{`
          @media print {
            /* Hide everything except our print container */
            body > *:not(.print-root) { display: none !important; }
            .print-root { display: block !important; }

            @page {
              size: A4;
              margin: 12mm;
            }
          }
        `}</style>

        <div className="print-root">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "24px",
              padding: "0",
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
                {/* Restaurant name */}
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#18181b",
                    marginBottom: "16px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {restaurant.name}
                </h2>

                {/* QR code */}
                <img
                  src={card.qrDataUrl}
                  alt={`QR code for table ${card.tableNumber}`}
                  width={180}
                  height={180}
                  style={{ display: "block", marginBottom: "16px" }}
                />

                {/* Scan prompt */}
                <p
                  style={{
                    fontSize: "14px",
                    color: "#52525b",
                    marginBottom: "8px",
                  }}
                >
                  Scan to view our menu
                </p>

                {/* Table number */}
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
        </div>
      </div>
    </>
  );
}
