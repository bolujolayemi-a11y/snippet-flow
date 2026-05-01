import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SnippetList from "../components/SnippetList";
import EditorPanel from "../components/EditorPanel";
import CreateSnippetModal from "../components/CreateSnippetModal"; 
import { supabase } from "../lib/supabase";
import { ChevronLeft, Plus, Menu, X } from "lucide-react"; 

function Dashboard() {
  const [snippets, setSnippets] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("Developer");
  const [mobileView, setMobileView] = useState("list");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- 1. READ: Fetch all snippets ---
  async function fetchSnippets() {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSnippets(data);
      // Only set a default if one isn't already selected
      if (data.length > 0 && !selectedSnippet) {
        setSelectedSnippet(data[0]);
      }
    }
  }

  // --- 2. UPDATE: Save changes to code ---
  const handleUpdate = async (id, updatedCode) => {
    const { error } = await supabase
      .from('snippets')
      .update({ code: updatedCode })
      .eq('id', id);

    if (!error) {
      // Update local state so UI is fast
      setSnippets(prev => prev.map(s => s.id === id ? { ...s, code: updatedCode } : s));
      console.log("Snippet updated in Supabase");
    } else {
      alert("Save failed: " + error.message);
    }
  };

  // --- 3. DELETE: Remove snippet ---
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this, ${userName}?`)) return;

    const { error } = await supabase
      .from('snippets')
      .delete()
      .eq('id', id);

    if (!error) {
      const updatedSnippets = snippets.filter(s => s.id !== id);
      setSnippets(updatedSnippets);
      
      // On mobile, send user back to list after deleting
      setMobileView("list");

      // Select the next available snippet or null
      if (selectedSnippet?.id === id) {
        setSelectedSnippet(updatedSnippets.length > 0 ? updatedSnippets[0] : null);
      }
    } else {
      alert("Delete failed: " + error.message);
    }
  };

  const handleSelectSnippet = (snippet) => {
    setSelectedSnippet(snippet);
    setMobileView("editor");
  };

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      }
    }
    getUserData();
    fetchSnippets();
  }, []); 

  return (
    <div className="flex h-screen w-full bg-[#0B0B0C] text-white overflow-hidden relative">
      
      {/* SIDEBAR */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-[#0B0B0C]
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:block
      `}>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 p-2 text-gray-400">
          <X size={20} />
        </button>
        <Sidebar count={snippets.length} planType="free" onNewSnippet={() => setIsModalOpen(true)} />
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* SNIPPET LIST */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-white/5 shrink-0 h-full overflow-y-auto bg-white/1`}>
        <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0B0B0C]">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-1"><Menu size={20} /></button>
            <h2 className="text-xl font-black tracking-tighter">Snippets</h2>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="p-2 bg-purple-500 rounded-lg"><Plus size={18} /></button>
        </div>
        <SnippetList snippets={snippets} onSelect={handleSelectSnippet} activeId={selectedSnippet?.id} onNewSnippet={() => setIsModalOpen(true)} />
      </div>

      {/* EDITOR PANEL */}
      <div className={`${mobileView === 'editor' ? 'flex' : 'hidden'} md:flex flex-col flex-1 h-full overflow-hidden bg-[#050505]`}>
        <div className="md:hidden flex items-center p-4 border-b border-white/5 bg-black">
          <button onClick={() => setMobileView("list")} className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-widest">
            <ChevronLeft size={20} /> Back
          </button>
        </div>
        <EditorPanel 
          snippet={selectedSnippet} 
          onSave={handleUpdate} // Restored logic
          onDelete={handleDelete} // Restored logic
        />
      </div>

      {isModalOpen && (
        <CreateSnippetModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSnippets();
            setMobileView("list");
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;