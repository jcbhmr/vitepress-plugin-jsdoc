import jsdoc from "vitepress-plugin-jsdoc/doc.json";
export default {
  paths() {
    return jsdoc.docs
      .filter((x) => x.kind !== "package")
      .map((x) => ({ params: { ...x, slug: x.longname.replaceAll("#", ".") } }));
  },
};
