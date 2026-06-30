import type { Post } from "@/lib/blog";

import { post as rutificadorEmpresas } from "./articles/rutificador-de-empresas-chile";
import { post as rutificadorSii } from "./articles/rutificador-sii-buscar-empresas-por-rut";
import { post as empresasExcel } from "./articles/base-de-datos-empresas-chilenas-excel";
import { post as comprarBaseDatos } from "./articles/comprar-base-de-datos-chile";
import { post as personas } from "./articles/base-de-datos-de-personas-chile";
import { post as correosTelefonos } from "./articles/base-de-datos-correos-telefonos-empresas";
import { post as municipalidades } from "./articles/base-de-datos-municipalidades-chile";
import { post as colegios } from "./articles/base-de-datos-colegios-chile";
import { post as directorioEjecutivos } from "./articles/directorio-empresas-ejecutivos-chile";
import { post as pymes } from "./articles/base-de-datos-pymes-chile";

export const posts: Post[] = [
  rutificadorEmpresas,
  rutificadorSii,
  empresasExcel,
  comprarBaseDatos,
  personas,
  correosTelefonos,
  municipalidades,
  colegios,
  directorioEjecutivos,
  pymes,
];
