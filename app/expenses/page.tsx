"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Modal, Field, inputCls, Confirm, Screen } from "@/components/ui";
import { api } from "@/lib/api";
import { formatInr, waUrl } from "@/lib/format";

type Cat = { _id: string; name: string; includeInCommonExpense: boolean; commonRole: string };
type Exp = {
  _id: string;
  title: string;
  amount: number;
  date: string;
  expenseType: string;
  paymentMethod: string;
  notes: string;
  bills: { url: string; name: string }[];
  whatsappShared: boolean;
  categoryId?: Cat;
};

export default function ExpensesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<Exp[]>([]);
  const [open, setOpen] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: "", includeInCommonExpense: false, commonRole: "normal" });
  const [form, setForm] = useState({
    categoryId: "",
    expenseType: "general",
    title: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "cash",
    notes: "",
    bills: [] as { url: string; name: string; contentType?: string }[],
    whatsappShared: false,
  });

  async function load() {
    const c = await api.get<{ categories: Cat[] }>("/api/expense-categories");
    const e = await api.get<{ expenses: Exp[] }>("/api/expenses");
    setCats(c.categories);
    setItems(e.expenses);
  }
  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const next = [...form.bills];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Upload failed");
        continue;
      }
      next.push({ url: data.url, name: data.name, contentType: data.contentType });
    }
    setForm({ ...form, bills: next });
  }

  async function save() {
    if (edit) await api.put(`/api/expenses/${edit}`, { ...form, amount: Number(form.amount) });
    else await api.post("/api/expenses", { ...form, amount: Number(form.amount) });
    setOpen(false);
    setEdit(null);
    await load();
  }

  return (
    <>
      <Header title="ખર્ચ" />
      <Screen>
        <div className="flex gap-2 mb-3">
          <button className="bg-navy text-white rounded-xl px-3 py-2 text-sm" onClick={() => { setEdit(null); setForm({ ...form, title: "", amount: "", bills: [] }); setOpen(true); }}>
            + ખર્ચ
          </button>
          <button className="bg-white rounded-xl px-3 py-2 text-sm" onClick={() => setOpenCat(true)}>
            + કેટેગરી
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {cats.map((c) => (
            <span key={c._id} className="text-xs bg-white rounded-full px-3 py-1">
              {c.name}
            </span>
          ))}
        </div>
        <div className="space-y-3">
          {items.map((e) => (
            <article key={e._id} className="card-surface p-4">
              <div className="flex justify-between">
                <h3 className="font-guj font-semibold">{e.title}</h3>
                <span className={`text-[10px] rounded-full px-2 py-0.5 ${e.expenseType === "common" ? "bg-amber-100" : "bg-slate-100"}`}>
                  {e.expenseType === "common" ? "કોમન" : "જનરલ"}
                </span>
              </div>
              <p className="text-sm">{formatInr(e.amount)} · {(e.categoryId as Cat)?.name}</p>
              <div className="flex gap-3 text-xs mt-2">
                <button
                  onClick={() => {
                    setEdit(e._id);
                    setForm({
                      categoryId: (e.categoryId as Cat)?._id || "",
                      expenseType: e.expenseType,
                      title: e.title,
                      amount: String(e.amount),
                      date: e.date.slice(0, 10),
                      paymentMethod: e.paymentMethod,
                      notes: e.notes,
                      bills: e.bills || [],
                      whatsappShared: e.whatsappShared,
                    });
                    setOpen(true);
                  }}
                >
                  એડિટ
                </button>
                <a
                  href={waUrl("9999999999", `Krishna Residency ખર્ચ:\n${e.title}\nરકમ: ${formatInr(e.amount)}`)}
                  target="_blank"
                  className="text-green-700"
                >
                  WhatsApp
                </a>
                <button className="text-red-600" onClick={() => setDel(e._id)}>
                  ડિલીટ
                </button>
              </div>
            </article>
          ))}
        </div>
      </Screen>
      <Modal open={open} title="ખર્ચ" onClose={() => setOpen(false)}>
        <Field label="કેટેગરી">
          <select className={inputCls} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">પસંદ</option>
            {cats.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ખર્ચ પ્રકાર">
          <select className={inputCls} value={form.expenseType} onChange={(e) => setForm({ ...form, expenseType: e.target.value })}>
            <option value="general">જનરલ ખર્ચ</option>
            <option value="common">કોમન ખર્ચ</option>
          </select>
        </Field>
        <Field label="શીર્ષક (ગુજરાતી)">
          <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="રકમ">
          <input className={inputCls} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </Field>
        <Field label="તારીખ">
          <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="પેમેન્ટ">
          <select className={inputCls} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            <option value="cash">કેશ</option>
            <option value="bank">બેંક</option>
            <option value="upi">UPI</option>
            <option value="cheque">ચેક</option>
          </select>
        </Field>
        <Field label="નોંધ">
          <input className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        <Field label="બિલ (છબી/PDF)">
          <input type="file" multiple onChange={(e) => upload(e.target.files)} />
          <ul className="text-xs mt-1">
            {form.bills.map((b) => (
              <li key={b.url}>
                <a href={b.url} className="text-blue-700" target="_blank">
                  {b.name}
                </a>
              </li>
            ))}
          </ul>
        </Field>
        <button onClick={save} className="btn-primary">
          સેવ
        </button>
      </Modal>
      <Modal open={openCat} title="કેટેગરી" onClose={() => setOpenCat(false)}>
        <Field label="નામ">
          <input className={inputCls} value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2 text-sm mb-3">
          <input type="checkbox" checked={catForm.includeInCommonExpense} onChange={(e) => setCatForm({ ...catForm, includeInCommonExpense: e.target.checked })} />
          માસિક કોમન સ્પ્લિટમાં ગણો
        </label>
        <Field label="કોમન બેલેન્સ રોલ">
          <select className={inputCls} value={catForm.commonRole} onChange={(e) => setCatForm({ ...catForm, commonRole: e.target.value })}>
            <option value="normal">સામાન્ય</option>
            <option value="common_credit">કોમન ક્રેડિટ</option>
            <option value="common_debit">કોમન ડેબિટ</option>
          </select>
        </Field>
        <button
          onClick={async () => {
            await api.post("/api/expense-categories", catForm);
            setOpenCat(false);
            await load();
          }}
          className="btn-primary"
        >
          સેવ
        </button>
      </Modal>
      <Confirm
        open={!!del}
        message="ખર્ચ ડિલીટ?"
        onNo={() => setDel(null)}
        onYes={async () => {
          if (del) await api.del(`/api/expenses/${del}`);
          setDel(null);
          await load();
        }}
      />
    </>
  );
}
