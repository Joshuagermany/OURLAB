"use client";
import { useEffect, useRef, useState } from "react";

type SearchLabFormProps = {
  variant: "write" | "browse";
};

export default function SearchLabForm({ variant }: SearchLabFormProps) {
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [lab, setLab] = useState("");
  const [univItems, setUnivItems] = useState<Array<{ id: number; name: string; region?: string; type?: string }>>([]);
  const [deptItems, setDeptItems] = useState<Array<{ id: number; name: string; university_id: number }>>([]);
  const [labItems, setLabItems] = useState<Array<{ id: number; name: string; department_id: number; university_id: number; professor_name?: string }>>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [selectedUniversityName, setSelectedUniversityName] = useState<string | null>(null);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<string | null>(null);
  const abortRef = useRef<{ univ?: AbortController; dept?: AbortController; lab?: AbortController }>({});
  const univReqId = useRef(0);
  const deptReqId = useRef(0);
  const labReqId = useRef(0);
  const [isUnivOpen, setIsUnivOpen] = useState(false);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);

  useEffect(() => {
    if (!university || (selectedUniversityName && university === selectedUniversityName) || !isUnivOpen) {
      setUnivItems([]);
      return;
    }
    abortRef.current.univ?.abort();
    const c = new AbortController();
    abortRef.current.univ = c;
    const q = encodeURIComponent(university);
    const rid = ++univReqId.current;
    fetch(`/api/universities?q=${q}`, { signal: c.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (rid === univReqId.current) setUnivItems(d.items);
      })
      .catch(() => {});
  }, [university, selectedUniversityName, isUnivOpen]);

  useEffect(() => {
    if (!department || (selectedDepartmentName && department === selectedDepartmentName) || !isDeptOpen) {
      setDeptItems([]);
      return;
    }
    abortRef.current.dept?.abort();
    const c = new AbortController();
    abortRef.current.dept = c;
    const q = encodeURIComponent(department);
    const u = selectedUniversityId ? `&university_id=${selectedUniversityId}` : "";
    const rid = ++deptReqId.current;
    fetch(`/api/departments?q=${q}${u}`, { signal: c.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (rid === deptReqId.current) setDeptItems(d.items);
      })
      .catch(() => {});
  }, [department, selectedUniversityId, selectedDepartmentName, isDeptOpen]);

  useEffect(() => {
    if (!lab || !isLabOpen) {
      setLabItems([]);
      return;
    }
    abortRef.current.lab?.abort();
    const c = new AbortController();
    abortRef.current.lab = c;
    const q = encodeURIComponent(lab);
    const u = selectedUniversityId ? `&university_id=${selectedUniversityId}` : "";
    const rid = ++labReqId.current;
    fetch(`/api/labs?q=${q}${u}`, { signal: c.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (rid === labReqId.current) setLabItems(d.items);
      })
      .catch(() => {});
  }, [lab, isLabOpen, selectedUniversityId]);

  return (
    <form className="mx-auto max-w-3xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative">
          <input
            type="text"
            value={university}
            onChange={(e) => {
              const v = e.target.value;
              setUniversity(v);
              if (selectedUniversityName && v !== selectedUniversityName) {
                setSelectedUniversityId(null);
                setSelectedUniversityName(null);
              }
            }}
            placeholder="대학교 검색"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            onFocus={() => setIsUnivOpen(true)}
            onBlur={() => setTimeout(() => setIsUnivOpen(false), 50)}
          />
          {isUnivOpen && univItems.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-black/10 bg-white shadow" role="listbox" onMouseDownCapture={(e) => e.preventDefault()}>
              {univItems.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setUniversity(u.name);
                    setSelectedUniversityId(u.id);
                    setSelectedUniversityName(u.name);
                    setUnivItems([]);
                    setIsUnivOpen(false);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setUniversity(u.name);
                    setSelectedUniversityId(u.id);
                    setSelectedUniversityName(u.name);
                    setUnivItems([]);
                    setIsUnivOpen(false);
                  }}
                >
                  {u.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={department}
            onChange={(e) => {
              const v = e.target.value;
              setDepartment(v);
              if (selectedDepartmentName && v !== selectedDepartmentName) {
                setSelectedDepartmentName(null);
              }
            }}
            placeholder="학과 검색"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            onFocus={() => setIsDeptOpen(true)}
            onBlur={() => setTimeout(() => setIsDeptOpen(false), 50)}
          />
          {isDeptOpen && deptItems.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-black/10 bg-white shadow" role="listbox" onMouseDownCapture={(e) => e.preventDefault()}>
              {deptItems.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setDepartment(d.name);
                    setSelectedDepartmentName(d.name);
                    setDeptItems([]);
                    setIsDeptOpen(false);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDepartment(d.name);
                    setSelectedDepartmentName(d.name);
                    setDeptItems([]);
                    setIsDeptOpen(false);
                  }}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={lab}
            onChange={(e) => setLab(e.target.value)}
            placeholder={variant === "write" ? "연구실 검색(+추가)" : "연구실 검색"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            onFocus={() => setIsLabOpen(true)}
            onBlur={() => setTimeout(() => setIsLabOpen(false), 50)}
          />
          {isLabOpen && labItems.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-black/10 bg-white shadow" role="listbox" onMouseDownCapture={(e) => e.preventDefault()}>
              {labItems.map((l) => (
                <button
                  type="button"
                  key={l.id}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-100"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setLab(l.name);
                    setIsLabOpen(false);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setLab(l.name);
                    setIsLabOpen(false);
                  }}
                >
                  {l.name}
                  {l.professor_name ? ` · ${l.professor_name}` : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button type="submit" className="rounded-md border border-black/10 px-4 py-2 text-black hover:bg-gray-100">
          검색
        </button>
      </div>
    </form>
  );
}

