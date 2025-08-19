"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SearchLabFormProps = {
  variant: "write" | "browse";
};

export default function SearchLabForm({ variant }: SearchLabFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [lab, setLab] = useState("");
  const [univItems, setUnivItems] = useState<Array<{ id: number; name: string; region?: string; type?: string }>>([]);
  const [deptItems, setDeptItems] = useState<Array<{ id: number; name: string; university_id: number }>>([]);
  const [labItems, setLabItems] = useState<Array<{ id: number; name: string; department_id: number; university_id: number; professor_name?: string }>>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [selectedUniversityName, setSelectedUniversityName] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
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

  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<Array<{ id: number; name: string; professor_name?: string; homepage_url?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 검색 실행 함수
  const performSearch = async (universityId: number, departmentId: number, searchQuery: string) => {
    setIsSearching(true);
    try {
      const queryParams = new URLSearchParams({
        university_id: universityId.toString(),
        department_id: departmentId.toString()
      });
      
      if (searchQuery.trim()) {
        queryParams.append('q', searchQuery.trim());
      }
      
      const response = await fetch(`/api/labs?${queryParams.toString()}`, {
        cache: "no-store"
      });
      const data = await response.json();
      setSearchResults(data.items);
    } catch (error) {
      console.error("검색 중 오류가 발생했습니다:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // URL 파라미터에서 검색 상태 복원 (초기 로드 시에만)
  useEffect(() => {
    const univParam = searchParams.get('university');
    const deptParam = searchParams.get('department');
    const labParam = searchParams.get('lab');
    
    // 이미 값이 설정되어 있으면 복원하지 않음
    if (univParam && !selectedUniversityName) {
      setUniversity(univParam);
      setSelectedUniversityName(univParam);
      // 대학교 ID 찾기
      fetch(`/api/universities?q=${encodeURIComponent(univParam)}`)
        .then(r => r.json())
        .then(data => {
          const foundUniv = data.items.find((u: any) => u.name === univParam);
          if (foundUniv) {
            setSelectedUniversityId(foundUniv.id);
          }
        })
        .catch(() => {});
    }
    if (deptParam && univParam && !selectedDepartmentName) {
      setDepartment(deptParam);
      setSelectedDepartmentName(deptParam);
      // 학과 ID 찾기 (대학교 ID가 설정된 후에 실행)
      if (selectedUniversityId) {
        fetch(`/api/departments?q=${encodeURIComponent(deptParam)}&university_id=${selectedUniversityId}`)
          .then(r => r.json())
          .then(data => {
            const foundDept = data.items.find((d: any) => d.name === deptParam);
            if (foundDept) {
              setSelectedDepartmentId(foundDept.id);
            }
          })
          .catch(() => {});
      }
    }
    if (labParam && !lab) {
      setLab(labParam);
    }
  }, [searchParams]); // selectedUniversityId 의존성 제거

  // 대학교 ID가 설정된 후 학과 ID 복원 및 검색 실행
  useEffect(() => {
    const deptParam = searchParams.get('department');
    const labParam = searchParams.get('lab');
    
    if (deptParam && selectedUniversityName && selectedUniversityId && !selectedDepartmentId) {
      fetch(`/api/departments?q=${encodeURIComponent(deptParam)}&university_id=${selectedUniversityId}`)
        .then(r => r.json())
        .then(data => {
          const foundDept = data.items.find((d: any) => d.name === deptParam);
          if (foundDept) {
            setSelectedDepartmentId(foundDept.id);
            
            // 학과 ID가 설정되면 자동으로 검색 실행
            setTimeout(() => {
              performSearch(selectedUniversityId, foundDept.id, labParam || '');
            }, 100);
          }
        })
        .catch(() => {});
    }
  }, [selectedUniversityId, searchParams, selectedUniversityName, selectedDepartmentId]);

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
    const d = selectedDepartmentId ? `&department_id=${selectedDepartmentId}` : "";
    const rid = ++labReqId.current;
    fetch(`/api/labs?q=${q}${u}${d}`, { signal: c.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (rid === labReqId.current) setLabItems(d.items);
      })
      .catch(() => {});
  }, [lab, isLabOpen, selectedUniversityId, selectedDepartmentId]);

  // 검색 함수
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("검색 시도:", {
      selectedUniversityId,
      selectedDepartmentId,
      selectedUniversityName,
      selectedDepartmentName,
      lab
    });
    
    if (!selectedUniversityId || !selectedDepartmentId) {
      alert("대학교와 학과를 모두 선택해주세요.");
      return;
    }

    // URL 업데이트
    const newSearchParams = new URLSearchParams();
    if (selectedUniversityName) newSearchParams.set('university', selectedUniversityName);
    if (selectedDepartmentName) newSearchParams.set('department', selectedDepartmentName);
    if (lab.trim()) newSearchParams.set('lab', lab.trim());
    
    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
    router.replace(newUrl, { scroll: false });

    // 검색 실행
    await performSearch(selectedUniversityId, selectedDepartmentId, lab);
  };

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
          // 대학교 변경 시 학과와 연구실 초기화
          setDepartment("");
          setSelectedDepartmentName(null);
          setSelectedDepartmentId(null);
          setLab("");
          setSearchResults([]);
          setUnivItems([]);
          setIsUnivOpen(false);
          setUnivHighlightedIndex(-2);
          
          // URL 업데이트
          const newSearchParams = new URLSearchParams();
          newSearchParams.set('university', selectedItem.name);
          const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
          router.replace(newUrl, { scroll: false });
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
          setSelectedDepartmentId(selectedItem.id);
          // 학과 변경 시 연구실 초기화
          setLab("");
          setSearchResults([]);
          setDeptItems([]);
          setIsDeptOpen(false);
          setDeptHighlightedIndex(-2);
          
          // URL 업데이트
          const newSearchParams = new URLSearchParams();
          if (selectedUniversityName) newSearchParams.set('university', selectedUniversityName);
          newSearchParams.set('department', selectedItem.name);
          const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
          router.replace(newUrl, { scroll: false });
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
    <form className="w-full" onSubmit={handleSearch}>
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
                    // 대학교 변경 시 학과와 연구실 초기화
                    setDepartment("");
                    setSelectedDepartmentName(null);
                    setSelectedDepartmentId(null);
                    setLab("");
                    setSearchResults([]);
                    setUnivItems([]);
                    setIsUnivOpen(false);
                    setUnivHighlightedIndex(-2);
                    
                    // URL 업데이트
                    const newSearchParams = new URLSearchParams();
                    newSearchParams.set('university', u.name);
                    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
                    router.replace(newUrl, { scroll: false });
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setUniversity(u.name);
                    setSelectedUniversityId(u.id);
                    setSelectedUniversityName(u.name);
                    // 대학교 변경 시 학과와 연구실 초기화
                    setDepartment("");
                    setSelectedDepartmentName(null);
                    setSelectedDepartmentId(null);
                    setLab("");
                    setSearchResults([]);
                    setUnivItems([]);
                    setIsUnivOpen(false);
                    setUnivHighlightedIndex(-2);
                    
                    // URL 업데이트
                    const newSearchParams = new URLSearchParams();
                    newSearchParams.set('university', u.name);
                    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
                    router.replace(newUrl, { scroll: false });
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
                    setSelectedDepartmentId(d.id);
                    // 학과 변경 시 연구실 초기화
                    setLab("");
                    setSearchResults([]);
                    setDeptItems([]);
                    setIsDeptOpen(false);
                    setDeptHighlightedIndex(-2);
                    
                    // URL 업데이트
                    const newSearchParams = new URLSearchParams();
                    if (selectedUniversityName) newSearchParams.set('university', selectedUniversityName);
                    newSearchParams.set('department', d.name);
                    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
                    router.replace(newUrl, { scroll: false });
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDepartment(d.name);
                    setSelectedDepartmentName(d.name);
                    setSelectedDepartmentId(d.id);
                    // 학과 변경 시 연구실 초기화
                    setLab("");
                    setSearchResults([]);
                    setDeptItems([]);
                    setIsDeptOpen(false);
                    setDeptHighlightedIndex(-2);
                    
                    // URL 업데이트
                    const newSearchParams = new URLSearchParams();
                    if (selectedUniversityName) newSearchParams.set('university', selectedUniversityName);
                    newSearchParams.set('department', d.name);
                    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
                    router.replace(newUrl, { scroll: false });
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
                placeholder="(선택) 교수님 이름 또는 연구실명으로 검색"
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
            <button 
              type="submit" 
              className="rounded-md border border-black/10 px-4 py-2 text-black hover:bg-gray-100 whitespace-nowrap"
              disabled={isSearching}
            >
              {isSearching ? "검색 중..." : "검색"}
            </button>
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      {searchResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedUniversityName} {selectedDepartmentName}
            {lab.trim() && ` - "${lab.trim()}" 검색결과`}
            연구실 목록 ({searchResults.length}개)
          </h3>
          <div className="space-y-3">
            {searchResults.map((lab) => (
                                  <div 
                      key={lab.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        // variant에 따라 다른 페이지로 이동
                        if (variant === "write") {
                          // 평가용 페이지로 이동
                          window.location.href = `/labs/${lab.id}/evaluate`;
                        } else {
                          // 확인용 페이지로 이동
                          window.location.href = `/labs/${lab.id}/view`;
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{lab.name}</h4>
                          {lab.professor_name && (
                            <p className="text-sm text-gray-600 mt-1">교수: {lab.professor_name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {lab.homepage_url && (
                            <a
                              href={lab.homepage_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              홈페이지 →
                            </a>
                          )}
                          <span className="text-blue-600 hover:text-blue-800 text-sm">
                            상세보기 →
                          </span>
                        </div>
                      </div>
                    </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && !isSearching && selectedUniversityId && selectedDepartmentId && (
        <div className="mt-6 text-center text-gray-500">
          {lab.trim() 
            ? `"${lab.trim()}"에 해당하는 연구실을 찾을 수 없습니다.`
            : "해당 대학교와 학과에서 연구실을 찾을 수 없습니다."
          }
      </div>
      )}
    </form>
  );
}

