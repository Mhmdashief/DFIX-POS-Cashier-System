import { getTransactionById } from "@/app/actions/transaction";
import { notFound } from "next/navigation";
import PrintAutoTrigger from "./PrintAutoTrigger";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const formatDate = (d: any) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "-";

export default async function PrintNotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTransactionById(id);
  if (!data) notFound();

  const nama = data.customer?.name || (data as any).customerName || "Umum";
  const hp = data.customer?.phone || "-";
  const alamat = data.customer?.address || "-";
  const invoiceCode = (data as any).invoiceCode || `TRX-${data.id.slice(0, 8)}`;
  const totalAmount = Number((data as any).totalAmount || 0);
  const dpAmount = Number((data as any).dpAmount || 0);
  const sisa = totalAmount - dpAmount;
  const materials = (data as any).materials || [];

  return (
    <div>
      <PrintAutoTrigger />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 13px;
          color: #161616;
          background: #fff;
        }

        .nota {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .header { text-align: center; margin-bottom: 20px; }

        .logo-badge {
          display: inline-block;
          background: #e53935;
          color: #fff;
          font-weight: 900;
          font-size: 20px;
          font-style: italic;
          padding: 5px 14px;
          border-radius: 8px;
          letter-spacing: -0.5px;
        }

        .store-name { font-size: 15px; font-weight: 700; margin-top: 10px; }
        .invoice-sub { font-size: 12px; color: #888; margin-top: 4px; }

        hr { border: none; border-top: 1px solid #eee; margin: 14px 0; }
        hr.dashed { border-top: 1px dashed #ccc; }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 7px 0;
          gap: 8px;
        }
        .row .label { color: #666; flex-shrink: 0; }
        .row .value { font-weight: 700; text-align: right; }

        .section-title {
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #2D4F53;
          margin: 16px 0 8px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-weight: 900;
          font-size: 14px;
          padding: 10px 0;
        }

        .footer {
          text-align: center;
          font-size: 11px;
          color: #aaa;
          margin-top: 28px;
          padding-top: 14px;
          border-top: 1px solid #eee;
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm 15mm;
          }

          html, body {
            width: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .nota {
            max-width: 100%;
            padding: 0;
            margin: 0;
          }

          /* Prevent rows from being split across pages */
          .row, .total-row { page-break-inside: avoid; }
        }
      `}</style>

      <div className="nota">
        {/* HEADER */}
        <div className="header">
          <div className="logo-badge">D&apos;fix</div>
          <p className="store-name">Toko Reparasi D&apos;fix</p>
          <p className="invoice-sub">
            {invoiceCode} &nbsp;·&nbsp; {formatDate((data as any).createdAt)}
          </p>
        </div>

        <hr />

        {/* INFO TRANSAKSI */}
        <div className="row">
          <span className="label">ID Transaksi</span>
          <span className="value">{invoiceCode}</span>
        </div>
        <div className="row">
          <span className="label">Pelanggan</span>
          <span className="value">{nama}</span>
        </div>
        {hp !== "-" && (
          <div className="row">
            <span className="label">No. HP</span>
            <span className="value">{hp}</span>
          </div>
        )}
        {alamat !== "-" && (
          <div className="row">
            <span className="label">Alamat</span>
            <span className="value" style={{ maxWidth: "60%" }}>{alamat}</span>
          </div>
        )}
        <div className="row">
          <span className="label">Tanggal</span>
          <span className="value">{formatDate((data as any).createdAt)}</span>
        </div>

        <hr />

        {/* LAYANAN */}
        <p className="section-title">Layanan</p>
        <div className="row">
          <span className="label">{(data as any).serviceName || "-"}</span>
          <span className="value">{formatIDR(totalAmount)}</span>
        </div>
        {(data as any).category && (
          <div className="row">
            <span className="label" style={{ color: "#999", fontSize: 11 }}>Kategori</span>
            <span className="value" style={{ color: "#999", fontSize: 11 }}>{(data as any).category}</span>
          </div>
        )}

        {/* BAHAN DIGUNAKAN */}
        {materials.length > 0 && (
          <>
            <p className="section-title">Bahan Digunakan</p>
            {materials.map((m: any, i: number) => (
              <div className="row" key={i}>
                <span className="label">
                  {m.name}{m.variant ? ` (${m.variant})` : ""}
                </span>
                <span className="value">{m.qty} Pcs</span>
              </div>
            ))}
          </>
        )}

        <hr />

        {/* TOTAL */}
        <div className="total-row">
          <span>Total Harga</span>
          <span>{formatIDR(totalAmount)}</span>
        </div>

        <hr className="dashed" />

        {/* PEMBAYARAN */}
        <p className="section-title">Pembayaran</p>
        <div className="row">
          <span className="label">DP Dibayar</span>
          <span className="value">{formatIDR(dpAmount)}</span>
        </div>
        <div className="row">
          <span className="label">Sisa Tagihan</span>
          <span className="value" style={{ color: sisa > 0 ? "#e53935" : "#16a34a" }}>
            {formatIDR(sisa)}
          </span>
        </div>
        <div className="row">
          <span className="label">Metode Pembayaran</span>
          <span className="value">{(data as any).paymentMethod || "-"}</span>
        </div>
        <div className="row">
          <span className="label">Status Pembayaran</span>
          <span
            className="value"
            style={{ color: (data as any).paymentStatus === "LUNAS" ? "#16a34a" : "#2563eb" }}
          >
            {(data as any).paymentStatus || "-"}
          </span>
        </div>

        {/* CATATAN */}
        {(data as any).notes && (
          <>
            <hr />
            <p className="section-title">Catatan</p>
            <p style={{ color: "#555", fontSize: 12, lineHeight: 1.6 }}>
              {(data as any).notes}
            </p>
          </>
        )}

        {/* FOOTER */}
        <div className="footer">
          <p>Terima kasih atas kepercayaan Anda!</p>
          <p style={{ marginTop: 4 }}>D&apos;fix — Toko Reparasi Terpercaya</p>
        </div>
      </div>
    </div>
  );
}
