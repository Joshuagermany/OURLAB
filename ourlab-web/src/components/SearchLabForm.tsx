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
  
  // 키보드 네비게이션을 위한 상태
  const [univHighlightedIndex, setUnivHighlightedIndex] = useState(-2);
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-2);
  const [labHighlightedIndex, setLabHighlightedIndex] = useState(-2);

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

  // 키보드 네비게이션 핸들러들
  const handleUnivKeyDown = (e: React.KeyboardEvent) => {
    if (!isUnivOpen || univItems.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setUnivHighlightedIndex(prev => 
          prev === -2 ? 0 : prev < univItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setUnivHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : univItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (univHighlightedIndex >= 0 && univHighlightedIndex < univItems.length) {
          const selectedItem = univItems[univHighlightedIndex];
          setUniversity(selectedItem.name);
          setSelectedUniversityId(selectedItem.id);
          setSelectedUniversityName(selectedItem.name);
          setUnivItems([]);
          setIsUnivOpen(false);
          setUnivHighlightedIndex(-2);
        }
        break;
      case 'Escape':
        setIsUnivOpen(false);
        setUnivHighlightedIndex(-2);
        break;
    }
  };

  const handleDeptKeyDown = (e: React.KeyboardEvent) => {
    if (!isDeptOpen || deptItems.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setDeptHighlightedIndex(prev => 
          prev === -2 ? 0 : prev < deptItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setDeptHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : deptItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (deptHighlightedIndex >= 0 && deptHighlightedIndex < deptItems.length) {
          const selectedItem = deptItems[deptHighlightedIndex];
          setDepartment(selectedItem.name);
          setSelectedDepartmentName(selectedItem.name);
          setDeptItems([]);
          setIsDeptOpen(false);
          setDeptHighlightedIndex(-2);
        }
        break;
      case 'Escape':
        setIsDeptOpen(false);
        setDeptHighlightedIndex(-1);
        break;
    }
  };

  const handleLabKeyDown = (e: React.KeyboardEvent) => {
    if (!isLabOpen || labItems.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setLabHighlightedIndex(prev => 
          prev === -2 ? 0 : prev < labItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setLabHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : labItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (labHighlightedIndex >= 0 && labHighlightedIndex < labItems.length) {
          const selectedItem = labItems[labHighlightedIndex];
          setLab(selectedItem.name);
          setLabItems([]);
          setIsLabOpen(false);
          setLabHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsLabOpen(false);
        setLabHighlightedIndex(-1);
        break;
    }
  };

  return (
    <form className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              setUnivHighlightedIndex(-2);
            }}
            placeholder="대학교 검색"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            onFocus={() => setIsUnivOpen(true)}
            onBlur={() => setTimeout(() => setIsUnivOpen(false), 50)}
            onKeyDown={handleUnivKeyDown}
          />
          {isUnivOpen && univItems.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-black/10 bg-white shadow" role="listbox" onMouseDownCapture={(e) => e.preventDefault()}>
              {univItems.map((u, index) => (
                <button
                  type="button"
                  key={u.id}
                  className={`block w-full px-3 py-2 text-left ${
                    index === univHighlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setUniversity(u.name);
                    setSelectedUniversityId(u.id);
                    setSelectedUniversityName(u.name);
                    setUnivItems([]);
                    setIsUnivOpen(false);
                    setUnivHighlightedIndex(-2);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setUniversity(u.name);
                    setSelectedUniversityId(u.id);
                    setSelectedUniversityName(u.name);
                    setUnivItems([]);
                    setIsUnivOpen(false);
                    setUnivHighlightedIndex(-2);
                  }}
                  onMouseEnter={() => setUnivHighlightedIndex(index)}
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
              setDeptHighlightedIndex(-2);
            }}
            placeholder="학과 검색"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            onFocus={() => setIsDeptOpen(true)}
            onBlur={() => setTimeout(() => setIsDeptOpen(false), 50)}
            onKeyDown={handleDeptKeyDown}
          />
          {isDeptOpen && deptItems.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-black/10 bg-white shadow" role="listbox" onMouseDownCapture={(e) => e.preventDefault()}>
              {deptItems.map((d, index) => (
                <button
                  type="button"
                  key={d.id}
                  className={`block w-full px-3 py-2 text-left ${
                    index === deptHighlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setDepartment(d.name);
                    setSelectedDepartmentName(d.name);
                    setDeptItems([]);
                    setIsDeptOpen(false);
                    setDeptHighlightedIndex(-2);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDepartment(d.name);
                    setSelectedDepartmentName(d.name);
                    setDeptItems([]);
                    setIsDeptOpen(false);
                    setDeptHighlightedIndex(-2);
                  }}
                  onMouseEnter={() => setDeptHighlightedIndex(index)}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative sm:col-span-2">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={lab}
                onChange={(e) => {
                  setLab(e.target.value);
                  setLabHighlightedIndex(-2);
                }}
                placeholder="(선택) 교수님 이름으로 검색"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
                onFocus={() => setIsLabOpen(true)}
                onBlur={() => setTimeout(() => setIsLabOpen(false), 50)}
                onKeyDown={handleLabKeyDown}
              />
              {isLabOpen && labItems.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-black/10 bg-white shadow" role="listbox" onMouseDownCapture={(e) => e.preventDefault()}>
                  {labItems.map((l, index) => (
                    <button
                      type="button"
                      key={l.id}
                                        className={`block w-full px-3 py-2 text-left ${
                    index === labHighlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setLab(l.name);
                        setIsLabOpen(false);
                        setLabHighlightedIndex(-2);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLab(l.name);
                        setIsLabOpen(false);
                        setLabHighlightedIndex(-2);
                      }}
                      onMouseEnter={() => setLabHighlightedIndex(index)}
                    >
                      {l.name}
                      {l.professor_name ? ` · ${l.professor_name}` : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="rounded-md border border-black/10 px-4 py-2 text-black hover:bg-gray-100 whitespace-nowrap">
              검색
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

