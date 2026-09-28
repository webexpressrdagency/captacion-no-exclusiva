"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormConfig, FormField } from "@/lib/types";
import RichText from "./RichText";
import SignaturePad from "./SignaturePad";

interface Props {
  config: FormConfig;
}

type FieldValues = Record<string, string>;

const DRAFT_TOKEN_KEY = "cf_draft_token";

export default function FormRenderer({ config }: Props) {
  const [values, setValues] = useState<FieldValues>({});
  const [signatures, setSignatures] = useState<FieldValues>({});
  const [fileNames, setFileNames] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [draftMsg, setDraftMsg] = useState("");
  const [done, setDone] = useState<{ id: string } | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const allFields = useMemo(() => {
    const list: FormField[] = [];
    for (const block of config.blocks) {
      if (block.kind === "fieldRow") list.push(...block.fields);
    }
    return list;
  }, [config]);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(DRAFT_TOKEN_KEY)
        : null;
    if (!token) return;
    fetch(`/api/draft?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data) {
          setValues((prev) => ({ ...prev, ...json.data }));
          setDraftMsg("Se recuperó un borrador guardado.");
        }
      })
      .catch(() => {});
  }, []);

  const setValue = (name: string, v: string) => {
    setValues((prev) => ({ ...prev, [name]: v }));
  };

  const buildFormData = () => {
    const fd = new FormData(formRef.current!);
    for (const [name, dataUrl] of Object.entries(signatures)) {
      fd.set(name, dataUrl);
    }
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const fd = buildFormData();
      const res = await fetch("/api/submit", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fields || [json.error || "Ocurrió un error"]);
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_TOKEN_KEY);
      }
      setDone({ id: json.id });
    } catch {
      setErrors(["No se pudo enviar el formulario. Verifique su conexión."]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setDraftMsg("");
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(DRAFT_TOKEN_KEY)
          : null;
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, data: values }),
      });
      const json = await res.json();
      if (res.ok && typeof window !== "undefined") {
        localStorage.setItem(DRAFT_TOKEN_KEY, json.token);
        setDraftMsg(
          "Borrador guardado. Puede cerrar esta página y continuar luego desde este mismo enlace."
        );
      }
    } catch {
      setDraftMsg("No se pudo guardar el borrador.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const fd = buildFormData();
      const res = await fetch("/api/preview-pdf", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      setDraftMsg("No se pudo generar la vista previa del PDF.");
    } finally {
      setPreviewing(false);
    }
  };

  if (done) {
    return (
      <div className="cf-page">
        <div className="cf-sheet">
          <div className="cf-thankyou">
            <h1>{config.settings.thankYouTitle}</h1>
            <p>{config.settings.thankYouMessage}</p>
            <div style={{ marginTop: 20 }}>
              <a
                className="cf-btn cf-btn-primary"
                style={{ display: "inline-block", textDecoration: "none" }}
                href={`/api/submission-pdf/${done.id}`}
                target="_blank"
                rel="noreferrer"
              >
                Descargar PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cf-page"
      style={
        {
          background: config.design.backgroundColor,
          "--cf-primary": config.design.primaryColor,
        } as React.CSSProperties
      }
    >
      <form
        className="cf-sheet"
        ref={formRef}
        onSubmit={handleSubmit}
        style={{ fontFamily: config.design.fontFamily, color: config.design.textColor }}
      >
        <div className="cf-header">
          {config.design.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.design.logoUrl} alt="Logo" className="cf-logo" />
          ) : null}
        </div>

        <div className="cf-body">
          {errors.length > 0 && (
            <div className="cf-error-banner">
              <strong>Revise los siguientes campos:</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {draftMsg && (
            <div
              className="cf-error-banner"
              style={{ background: "#eef6ec", color: "#2e5c33", borderColor: "#cfe6d0" }}
            >
              {draftMsg}
            </div>
          )}

          {config.blocks.map((block) => {
            if (block.kind === "heading") {
              return (
                <div key={block.id} className={`cf-heading level-${block.level}`}>
                  {block.text}
                </div>
              );
            }
            if (block.kind === "richText") {
              return <RichText key={block.id} text={block.text} />;
            }
            if (block.kind === "divider") {
              return <hr key={block.id} className="cf-divider" />;
            }
            return (
              <div className="cf-row" key={block.id}>
                {block.fields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={values[field.name] || ""}
                    onChange={(v) => setValue(field.name, v)}
                    onSignature={(v) =>
                      setSignatures((prev) => ({ ...prev, [field.name]: v }))
                    }
                    onFiles={(names) =>
                      setFileNames((prev) => ({ ...prev, [field.name]: names }))
                    }
                    fileNames={fileNames[field.name]}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div className="cf-footer">
          <div className="cf-contact">
            {config.contact.phone && <span>📞 {config.contact.phone}</span>}
            {config.contact.website && <span>🌐 {config.contact.website}</span>}
            {config.contact.email && <span>✉️ {config.contact.email}</span>}
          </div>
          <div className="cf-actions">
            <button
              type="button"
              className="cf-btn cf-btn-ghost"
              onClick={handlePreview}
              disabled={previewing}
            >
              {previewing ? "Generando..." : "Vista previa PDF"}
            </button>
            <button
              type="button"
              className="cf-btn cf-btn-secondary"
              onClick={handleSaveDraft}
              disabled={savingDraft}
            >
              {savingDraft ? "Guardando..." : config.settings.saveDraftButtonText}
            </button>
            <button className="cf-btn cf-btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Enviando..." : config.settings.submitButtonText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  onSignature,
  onFiles,
  fileNames,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  onSignature: (v: string) => void;
  onFiles: (names: string[]) => void;
  fileNames?: string[];
}) {
  const widthClass = field.width !== "full" ? ` width-${field.width}` : "";

  const label = (
    <label className="cf-label" htmlFor={field.id}>
      {field.label}
      {field.required && <span className="req">*</span>}
    </label>
  );

  if (field.type === "signature") {
    return (
      <div className={`cf-field${widthClass}`}>
        {label}
        <SignaturePad name={field.name} onChange={onSignature} />
        {field.helpText && <span className="cf-help">{field.helpText}</span>}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className={`cf-field${widthClass}`}>
        {label}
        <input
          className="cf-file-input"
          id={field.id}
          type="file"
          name={field.name}
          multiple={field.multiple}
          accept={field.accept}
          required={field.required}
          onChange={(e) =>
            onFiles(Array.from(e.target.files || []).map((f) => f.name))
          }
        />
        {field.helpText && <span className="cf-help">{field.helpText}</span>}
        {fileNames && fileNames.length > 0 && (
          <div className="cf-file-list">{fileNames.join(", ")}</div>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={`cf-field${widthClass}`}>
        {label}
        <textarea
          className="cf-textarea"
          id={field.id}
          name={field.name}
          required={field.required}
          placeholder={field.placeholder}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={`cf-field${widthClass}`}>
        {label}
        <select
          className="cf-select"
          id={field.id}
          name={field.name}
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seleccione...</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className={`cf-field${widthClass}`}>
        {label}
        <div className="cf-radio-group">
          {(field.options || []).map((opt) => (
            <label className="cf-radio-option" key={opt}>
              <input
                type="radio"
                name={field.name}
                value={opt}
                checked={value === opt}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className={`cf-field${widthClass}`}>
        <label className="cf-checkbox-option">
          <input
            type="checkbox"
            name={field.name}
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "")}
          />
          {field.label}
          {field.required && <span className="req">*</span>}
        </label>
      </div>
    );
  }

  return (
    <div className={`cf-field${widthClass}`}>
      {label}
      <input
        className="cf-input"
        id={field.id}
        type={field.type}
        name={field.name}
        required={field.required}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.helpText && <span className="cf-help">{field.helpText}</span>}
    </div>
  );
}
