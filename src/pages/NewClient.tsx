import { useState } from "react";
import { supabase } from "../services/supabase";

interface Props {
  onCreated: () => void;
}

export default function NewClient({
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] =
    useState("");
  const [clientNotes, setClientNotes] =
    useState("");

  const [alias, setAlias] = useState("");
  const [mac, setMac] = useState("");
  const [app, setApp] = useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [deviceNotes, setDeviceNotes] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !name ||
      !alias ||
      !mac ||
      !startDate ||
      !endDate
    ) {
      alert(
        "Completa todos los campos obligatorios"
      );
      return;
    }

    setLoading(true);

    const {
      data: client,
      error: clientError,
    } = await supabase
      .from("clients")
      .insert({
        name,
        whatsapp,
        notes: clientNotes,
      })
      .select()
      .single();

    if (clientError) {
      alert(clientError.message);
      setLoading(false);
      return;
    }

    const { error: deviceError } =
      await supabase
        .from("devices")
        .insert({
          client_id: client.id,
          alias,
          mac_address: mac,
          app_name: app,
          start_date: startDate,
          end_date: endDate,
          notes: deviceNotes,
          active: true,
        });

    if (deviceError) {
      alert(deviceError.message);
      setLoading(false);
      return;
    }

    setName("");
    setWhatsapp("");
    setClientNotes("");

    setAlias("");
    setMac("");
    setApp("");

    setStartDate("");
    setEndDate("");

    setDeviceNotes("");

    onCreated();

    alert(
      "Cliente creado correctamente"
    );

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          fontWeight: "600",
          color: "#1f2937",
        }}
      >
        ➕ Nuevo Cliente
      </h2>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          Nombre *
        </label>
        <input
          placeholder="Nombre del cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          WhatsApp
        </label>
        <input
          placeholder="+34 666 123 456"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          URL del servidor
        </label>
        <textarea
          placeholder="Pega aquí la URL del servidor..."
          value={clientNotes}
          onChange={(e) => setClientNotes(e.target.value)}
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            resize: "vertical",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <hr
        style={{
          margin: "24px 0",
          border: "none",
          borderTop: "1px solid #e5e7eb",
        }}
      />

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          Alias Dispositivo *
        </label>
        <input
          placeholder="Nombre del dispositivo"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          MAC *
        </label>
        <input
          placeholder="Dirección MAC"
          value={mac}
          onChange={(e) => setMac(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          App IPTV
        </label>
        <input
          placeholder="Nombre de la aplicación"
          value={app}
          onChange={(e) => setApp(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          Inicio *
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          Notas Dispositivo
        </label>
        <textarea
          placeholder="Notas del dispositivo..."
          value={deviceNotes}
          onChange={(e) => setDeviceNotes(e.target.value)}
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            resize: "vertical",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "#667eea",
          color: "white",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#5568d3";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#667eea";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {loading ? "Guardando..." : "✓ Guardar Cliente"}
      </button>
    </form>
  );
}