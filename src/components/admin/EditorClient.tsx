"use client";

import { useState } from "react";
import { Block, FieldType, FieldWidth, FormConfig, FormField } from "@/lib/types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function slug(label: string) {
  return (
    label
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(" ")
      .map((w, i) =>
        i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join("") || uid("campo")
  );
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "email", label: "Correo" },
  { value: "tel", label: "Teléfono" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "select", label: "Lista desplegable" },
  { value: "radio", label: "Opción única" },
  { value: "checkbox", label: "Casilla" },
  { value: "signature", label: "Firma" },
  { value: "file", label: "Archivo" },
];

function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const target = index + dir;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function EditorClient({ initialConfig }: { initialConfig: FormConfig }) {
  const [config, setConfig] = useState<FormConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const blocks = config.blocks;

  const updateBlocks = (next: Block[]) => setConfig((c) => ({ ...c, blocks: next }));

  const addBlock = (kind: Block["kind"]) => {
    let block: Block;
    if (kind === "heading") {
      block = { kind: "heading", id: uid("h"), text: "Nuevo encabezado", level: 2 };
    } else if (kind === "richText") {
      block = { kind: "richText", id: uid("rt"), text: "Nuevo texto legal. Use **negrita** así." };
    } else if (kind === "divider") {
      block = { kind: "divider", id: uid("d") };
    } else {
      block = {
        kind: "fieldRow",
        id: uid("fr"),
        fields: [
          {
            id: uid("f"),
            type: "text",
            name: "nuevoCampo",
            label: "Nuevo campo",
            required: false,
            width: "full",
          },
        ],
      };
    }
    updateBlocks([...blocks, block]);
  };

  const removeBlock = (index: number) => {
    if (!confirm("¿Eliminar este bloque?")) return;
    updateBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, dir: -1 | 1) => updateBlocks(move(blocks, index, dir));

  const updateBlock = (index: number, next: Block) => {
    const copy = [...blocks];
    copy[index] = next;
    updateBlocks(copy);
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setConfig(json);
      setMessage("Cambios guardados.");
    } catch {
      setMessage("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div>
      {blocks.map((block, index) => (
        <div className="adm-block-item" key={block.id}>
          <div className="adm-block-header">
            <span className="adm-badge">{blockKindLabel(block.kind)}</span>
            <div className="adm-toolbar">
              <button className="adm-icon-btn" onClick={() => moveBlock(index, -1)} disabled={index === 0}>
                ↑
              </button>
              <button
                className="adm-icon-btn"
                onClick={() => moveBlock(index, 1)}
                disabled={index === blocks.length - 1}
              >
                ↓
              </button>
              <button className="adm-icon-btn" onClick={() => removeBlock(index)}>
                Eliminar
              </button>
            </div>
          </div>
          <BlockEditor block={block} onChange={(b) => updateBlock(index, b)} />
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 90px" }}>
        <button className="adm-icon-btn" onClick={() => addBlock("heading")}>
          + Encabezado
        </button>
        <button className="adm-icon-btn" onClick={() => addBlock("richText")}>
          + Texto legal
        </button>
        <button className="adm-icon-btn" onClick={() => addBlock("fieldRow")}>
          + Fila de campos
        </button>
        <button className="adm-icon-btn" onClick={() => addBlock("divider")}>
          + Separador
        </button>
      </div>

      <div className="adm-save-bar">
        {message && <span style={{ alignSelf: "center", fontSize: 13, color: "#2e5c33" }}>{message}</span>}
        <button className="cf-btn cf-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function blockKindLabel(kind: Block["kind"]) {
  switch (kind) {
    case "heading":
      return "Encabezado";
    case "richText":
      return "Texto legal";
    case "fieldRow":
      return "Campos";
    case "divider":
      return "Separador";
  }
}

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  if (block.kind === "heading") {
    return (
      <div className="adm-inline-fields">
        <div className="adm-field">
          <label>Texto</label>
          <input
            className="adm-input"
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        </div>
        <div className="adm-field">
          <label>Tamaño</label>
          <select
            className="adm-select"
            value={block.level}
            onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 })}
          >
            <option value={1}>Grande</option>
            <option value={2}>Mediano</option>
            <option value={3}>Pequeño</option>
          </select>
        </div>
      </div>
    );
  }

  if (block.kind === "richText") {
    return (
      <div className="adm-field">
        <textarea
          className="adm-textarea"
          rows={5}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      </div>
    );
  }

  if (block.kind === "divider") {
    return <p style={{ color: "#888", fontSize: 12.5, margin: 0 }}>Línea divisoria sin contenido.</p>;
  }

  // fieldRow
  const updateField = (fi: number, next: FormField) => {
    const fields = [...block.fields];
    fields[fi] = next;
    onChange({ ...block, fields });
  };

  const removeField = (fi: number) => {
    const fields = block.fields.filter((_, i) => i !== fi);
    onChange({ ...block, fields });
  };

  const addField = () => {
    const fields = [
      ...block.fields,
      {
        id: uid("f"),
        type: "text" as FieldType,
        name: "nuevoCampo" + block.fields.length,
        label: "Nuevo campo",
        required: false,
        width: (block.fields.length > 0 ? "half" : "full") as FieldWidth,
      },
    ];
    onChange({ ...block, fields });
  };

  return (
    <div>
      {block.fields.map((field, fi) => (
        <FieldEditor
          key={field.id}
          field={field}
          onChange={(f) => updateField(fi, f)}
          onRemove={() => removeField(fi)}
        />
      ))}
      <button className="adm-icon-btn" onClick={addField}>
        + Campo en esta fila
      </button>
    </div>
  );
}

function FieldEditor({
  field,
  onChange,
  onRemove,
}: {
  field: FormField;
  onChange: (f: FormField) => void;
  onRemove: () => void;
}) {
  const needsOptions = field.type === "select" || field.type === "radio";

  return (
    <div style={{ border: "1px solid #e6e6ea", borderRadius: 6, padding: 12, marginBottom: 10, background: "#fff" }}>
      <div className="adm-inline-fields">
        <div className="adm-field">
          <label>Etiqueta</label>
          <input
            className="adm-input"
            value={field.label}
            onChange={(e) => {
              const label = e.target.value;
              onChange({ ...field, label, name: field.name || slug(label) });
            }}
          />
        </div>
        <div className="adm-field">
          <label>Nombre interno (clave)</label>
          <input
            className="adm-input"
            value={field.name}
            onChange={(e) => onChange({ ...field, name: e.target.value })}
          />
        </div>
        <div className="adm-field">
          <label>Tipo</label>
          <select
            className="adm-select"
            value={field.type}
            onChange={(e) => onChange({ ...field, type: e.target.value as FieldType })}
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="adm-field">
          <label>Ancho</label>
          <select
            className="adm-select"
            value={field.width}
            onChange={(e) => onChange({ ...field, width: e.target.value as FieldWidth })}
          >
            <option value="full">Completo</option>
            <option value="half">Mitad</option>
            <option value="third">Un tercio</option>
          </select>
        </div>
        {needsOptions && (
          <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
            <label>Opciones (separadas por coma)</label>
            <input
              className="adm-input"
              value={(field.options || []).join(", ")}
              onChange={(e) =>
                onChange({
                  ...field,
                  options: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        )}
        {field.type === "file" && (
          <div className="adm-field">
            <label>Extensiones permitidas</label>
            <input
              className="adm-input"
              value={field.accept || ""}
              placeholder=".pdf,.jpg,.png"
              onChange={(e) => onChange({ ...field, accept: e.target.value })}
            />
          </div>
        )}
        {(field.type === "text" || field.type === "textarea" || field.type === "email" || field.type === "tel") && (
          <div className="adm-field">
            <label>Placeholder</label>
            <input
              className="adm-input"
              value={field.placeholder || ""}
              onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
            />
          </div>
        )}
        <div className="adm-field" style={{ gridColumn: "1 / -1" }}>
          <label>Texto de ayuda (opcional)</label>
          <input
            className="adm-input"
            value={field.helpText || ""}
            onChange={(e) => onChange({ ...field, helpText: e.target.value })}
          />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange({ ...field, required: e.target.checked })}
          />
          Obligatorio
        </label>
        {field.type === "file" && (
          <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={!!field.multiple}
              onChange={(e) => onChange({ ...field, multiple: e.target.checked })}
            />
            Permitir varios archivos
          </label>
        )}
        <button className="adm-icon-btn" onClick={onRemove}>
          Quitar campo
        </button>
      </div>
    </div>
  );
}
