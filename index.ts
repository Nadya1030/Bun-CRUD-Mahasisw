import { db } from "./db";
import fs from "fs";

function render(content: string) {
  const layout = fs.readFileSync("./views/layout.html", "utf8");
  return layout.replace("{{content}}", content);
}

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    try {

      // LIST DATA
      if (method === "GET" && path === "/") {
        const [rows]: any = await db.query("SELECT * FROM mahasiswa");

        let table = "";
        rows.forEach((m: any) => {
          table += `
            <tr class="border-t hover:bg-gray-50">
              <td class="p-2">${m.id}</td>
              <td class="p-2">${m.nama}</td>
              <td class="p-2">${m.jurusan}</td>
              <td class="p-2">${m.angkatan}</td>
              <td class="p-2 flex gap-2">
                <a href="/edit/${m.id}" class="text-blue-500 hover:underline">Edit</a>
                <a href="/hapus/${m.id}" class="text-red-500 hover:underline ml-2"
                  onclick="return confirm('Yakin hapus?')">Hapus</a>
              </td>
            </tr>
          `;
        });

        let view = fs.readFileSync("./views/mahasiswa.html", "utf8");
        view = view.replace("{{rows}}", table);

        return new Response(render(view), {
          headers: { "Content-Type": "text/html" },
        });
      }

      // FORM TAMBAH
      if (method === "GET" && path === "/tambah") {
        let view = fs.readFileSync("./views/form.html", "utf8");
        view = view
          .replace("{{judul}}", "Tambah Mahasiswa")
          .replace("{{action}}", "/simpan")
          .replace("{{nama}}", "")
          .replace("{{jurusan}}", "")
          .replace("{{angkatan}}", "");

        return new Response(render(view), {
          headers: { "Content-Type": "text/html" },
        });
      }

      // SIMPAN DATA
      if (method === "POST" && path === "/simpan") {
        const body = await req.formData();
        await db.query(
          "INSERT INTO mahasiswa (nama, jurusan, angkatan) VALUES (?, ?, ?)",
          [body.get("nama"), body.get("jurusan"), body.get("angkatan")]
        );
        return Response.redirect("/", 302);
      }

      // FORM EDIT
      if (method === "GET" && path.startsWith("/edit/")) {
        const id = path.split("/")[2];
        const [rows]: any = await db.query(
          "SELECT * FROM mahasiswa WHERE id=?", [id]
        );

        if (!rows.length) return new Response("Data tidak ditemukan", { status: 404 });

        const m = rows[0];
        let view = fs.readFileSync("./views/form.html", "utf8");
        view = view
          .replace("{{judul}}", "Edit Mahasiswa")
          .replace("{{action}}", `/update/${m.id}`)
          .replace("{{nama}}", m.nama)
          .replace("{{jurusan}}", m.jurusan)
          .replace("{{angkatan}}", m.angkatan);

        return new Response(render(view), {
          headers: { "Content-Type": "text/html" },
        });
      }

      // UPDATE DATA
      if (method === "POST" && path.startsWith("/update/")) {
        const id = path.split("/")[2];
        const body = await req.formData();
        await db.query(
          "UPDATE mahasiswa SET nama=?, jurusan=?, angkatan=? WHERE id=?",
          [body.get("nama"), body.get("jurusan"), body.get("angkatan"), id]
        );
        return Response.redirect("/", 302);
      }

      // HAPUS DATA
      if (method === "GET" && path.startsWith("/hapus/")) {
        const id = path.split("/")[2];
        await db.query("DELETE FROM mahasiswa WHERE id=?", [id]);
        return Response.redirect("/", 302);
      }

      return new Response("Halaman tidak ditemukan", { status: 404 });

    } catch (err) {
      console.error(err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log("✅ Server berjalan di http://localhost:3000");
