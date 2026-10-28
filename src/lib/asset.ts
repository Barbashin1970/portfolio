/** Адрес файла из public/ с приставкой сайта: на Pages это /portfolio/ (Р-18). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
