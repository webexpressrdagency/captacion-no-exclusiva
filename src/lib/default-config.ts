import { FormConfig } from "./types";

export const DEFAULT_CONFIG: FormConfig = {
  version: 1,
  updatedAt: new Date().toISOString(),
  meta: {
    title: "AUTORIZACIÓN DE VENTA NO EXCLUSIVA",
    browserTitle: "CAPTACIÓN NO EXCLUSIVA",
    description:
      "Formulario de autorización de venta no exclusiva de inmuebles.",
  },
  design: {
    logoUrl: "",
    primaryColor: "#7a1f2b",
    accentColor: "#b48a3f",
    backgroundColor: "#f5f2ec",
    textColor: "#1f1f1f",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  contact: {
    phone: "809.476.0850",
    website: "WWW.MRHOME.COM.DO",
    email: "VENTAS@MRHOME.COM.DO",
  },
  blocks: [
    {
      kind: "heading",
      id: "h-titulo",
      text: "AUTORIZACIÓN DE VENTA NO EXCLUSIVA",
      level: 1,
    },
    {
      kind: "richText",
      id: "rt-primera-parte",
      text: "Primera Parte: **DATOS DEL PROPIETARIO**",
    },
    {
      kind: "fieldRow",
      id: "fr-nombre",
      fields: [
        {
          id: "f-nombre",
          type: "text",
          name: "nombreCompleto",
          label: "Nombre Completo",
          required: true,
          width: "full",
        },
      ],
    },
    {
      kind: "fieldRow",
      id: "fr-domicilio-cedula",
      fields: [
        {
          id: "f-domicilio",
          type: "text",
          name: "domicilio",
          label: "Domicilio",
          required: true,
          width: "half",
        },
        {
          id: "f-cedula",
          type: "text",
          name: "cedulaPasaporteRnc",
          label: "No. Cédula, Pasaporte o RNC",
          required: true,
          width: "half",
        },
      ],
    },
    {
      kind: "fieldRow",
      id: "fr-nacionalidad-correo",
      fields: [
        {
          id: "f-nacionalidad",
          type: "text",
          name: "nacionalidad",
          label: "Nacionalidad",
          required: true,
          width: "half",
        },
        {
          id: "f-correo",
          type: "email",
          name: "correo",
          label: "Correo",
          required: true,
          width: "half",
        },
      ],
    },
    {
      kind: "fieldRow",
      id: "fr-celular",
      fields: [
        {
          id: "f-celular",
          type: "tel",
          name: "celular",
          label: "Celular",
          required: true,
          width: "half",
        },
      ],
    },
    { kind: "divider", id: "d-1" },
    {
      kind: "richText",
      id: "rt-segunda-parte",
      text:
        "Segunda Parte: **LA INMOBILIARIA**\n\n" +
        "**MR. HOME ASESORES INMOBILIARIOS SRL**, compañía inmobiliaria, constituida y organizada de conformidad con las leyes de la República Dominicana, identificada con el R.N.C. número 1-30-81134-2, con su domicilio social localizado en la Av. Núñez De Cáceres, Suite 1101, Torre Profesional NC, de esta ciudad de Santo Domingo, Distrito Nacional, Capital de la República Dominicana.\n\n" +
        "**LA PRIMERA PARTE** autoriza a **LA SEGUNDA PARTE** a realizar todas las gestiones de promoción y venta de la propiedad que se describe a continuación.",
    },
    {
      kind: "richText",
      id: "rt-descripcion-inmueble",
      text: "**DESCRIPCIÓN DEL INMUEBLE:**",
    },
    {
      kind: "fieldRow",
      id: "fr-inmueble-nombre-matricula",
      fields: [
        {
          id: "f-inmueble-nombre",
          type: "text",
          name: "inmuebleNombre",
          label: "Nombre",
          required: true,
          width: "half",
        },
        {
          id: "f-matricula",
          type: "text",
          name: "matricula",
          label: "Matrícula",
          required: true,
          width: "half",
        },
      ],
    },
    {
      kind: "fieldRow",
      id: "fr-direccion-valor",
      fields: [
        {
          id: "f-direccion-inmueble",
          type: "text",
          name: "direccionInmueble",
          label: "Dirección",
          required: true,
          width: "half",
        },
        {
          id: "f-valor-venta",
          type: "text",
          name: "valorVenta",
          label: "Valor de Venta",
          required: true,
          width: "half",
        },
      ],
    },
    {
      kind: "richText",
      id: "rt-honorarios",
      text:
        "Los honorarios por gestión inmobiliaria, corresponderá a un **CINCO POR CIENTO (5%) MÁS ITBIS** del valor total de la venta. Montos que serán pagados exclusivamente a la cuenta bancaria que **LA SEGUNDA PARTE** designe para estos fines a través del departamento de contabilidad cobros@mrhome.com.do y nunca directamente a los agentes que forman parte del equipo de ventas de **LA SEGUNDA PARTE**.",
    },
    {
      kind: "fieldRow",
      id: "fr-forma-pago",
      fields: [
        {
          id: "f-forma-pago",
          type: "text",
          name: "formaPagoComision",
          label: "Forma de pago de comisión",
          required: false,
          width: "full",
        },
      ],
    },
    {
      kind: "richText",
      id: "rt-vigencia-intro",
      text:
        "**VIGENCIA** Este acuerdo tendrá una duración inicial de meses, con la posibilidad de renovación automática, salvo que alguna de las partes comunique su deseo de NO renovación.",
    },
    {
      kind: "fieldRow",
      id: "fr-vigencia-meses",
      fields: [
        {
          id: "f-vigencia-meses",
          type: "number",
          name: "vigenciaMeses",
          label: "Vigencia (meses)",
          required: true,
          width: "third",
        },
      ],
    },
    {
      kind: "richText",
      id: "rt-declaraciones",
      text:
        "**LA PRIMERA PARTE DECLARA** que se compromete a suministrar a **LA SEGUNDA PARTE** todas las informaciones y documentos necesarios para la gestión inmobiliaria y del mismo modo reconoce que la comisión especificada será pagada en el porcentaje y forma indicado en el cuerpo del presente documento, siempre y cuando la negociación se realice a través de cualquiera de los miembros del equipo de **LA SEGUNDA PARTE**.\n\n" +
        "El propietario **RECONOCE** y **ACEPTA** que su profesión, empresa u oficio están dentro del marco legal, garantizando que sus recursos provienen de fuentes lícitas, y por tanto no violan las estipulaciones de la Ley 155-17 respecto al Lavado de Activos.\n\n" +
        "El propietario **RECONOCE** y **ACEPTA** que la empresa **MR HOME ASESORES INMOBILIARIOS SRL** en su función de Sujeto Obligado, puede solicitar las informaciones que considere pertinentes, tanto del inmueble como de su persona o empresa, siempre dentro del marco del cumplimiento de la Ley 155-17 respecto al Lavado de Activos.",
    },
    {
      kind: "fieldRow",
      id: "fr-captador",
      fields: [
        {
          id: "f-captador",
          type: "text",
          name: "captadorMrHome",
          label: "Captador(es) MR. HOME",
          required: false,
          width: "full",
        },
      ],
    },
    {
      kind: "richText",
      id: "rt-hecho-firmado",
      text: "Hecho y firmado en la ciudad de:",
    },
    {
      kind: "fieldRow",
      id: "fr-lugar-fecha",
      fields: [
        {
          id: "f-ciudad",
          type: "text",
          name: "ciudad",
          label: "Ciudad",
          required: true,
          width: "third",
        },
        {
          id: "f-dia",
          type: "text",
          name: "dia",
          label: "Día",
          required: true,
          width: "third",
        },
        {
          id: "f-mes",
          type: "text",
          name: "mes",
          label: "Mes",
          required: true,
          width: "third",
        },
      ],
    },
    { kind: "divider", id: "d-2" },
    {
      kind: "fieldRow",
      id: "fr-firma-propietario",
      fields: [
        {
          id: "f-firma-propietario",
          type: "signature",
          name: "firmaPropietario",
          label: "Firma Propietario / Representante",
          required: true,
          width: "full",
        },
      ],
    },
    {
      kind: "fieldRow",
      id: "fr-firma-mrhome",
      fields: [
        {
          id: "f-firma-mrhome",
          type: "signature",
          name: "firmaRepresentanteMrHome",
          label: "Firma Representante MR. HOME",
          required: true,
          width: "full",
        },
      ],
    },
    {
      kind: "richText",
      id: "rt-anexos",
      text:
        "**Anexar:** (Documentos indispensables para validar esta propiedad en nuestro sistema)\n" +
        "• Copia de título de Propiedad\n" +
        "• Copia de documento de identidad del propietario\n" +
        "• Registro mercantil (si la propiedad está a nombre de una empresa).\n\n" +
        "*En caso de que la persona que firma este acuerdo actúe en calidad de apoderado, debe anexar el poder legal correspondiente que acredite su representación.*",
    },
    {
      kind: "fieldRow",
      id: "fr-anexos",
      fields: [
        {
          id: "f-anexos",
          type: "file",
          name: "anexos",
          label: "Anexar documentos",
          required: true,
          width: "full",
          multiple: true,
          accept: ".pdf,.jpg,.jpeg,.png",
        },
      ],
    },
  ],
  settings: {
    submitButtonText: "Enviar",
    saveDraftButtonText: "Guardar",
    thankYouTitle: "¡Gracias!",
    thankYouMessage:
      "Hemos recibido su autorización de venta. Nuestro equipo se pondrá en contacto con usted en breve.",
    notifyEmail: "",
    notificationsEnabled: false,
    requireBothSignatures: true,
  },
};
