import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SnippetList from "../components/SnippetList";
import EditorPanel from "../components/EditorPanel";
import CreateSnippetModal from "../components/CreateSnippetModal"; 
import { supabase } from "../lib/supabase";
import { ChevronLeft, Plus } from "lucide-react"; // Icons for mobile navigation

function Dashboard() {
  const [snippets, setSnippets] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("Developer");
  
  // Mobile navigation state: "list" or "editor"
  const [mobileView, setMobileView] = useState("list");

  async function fetchSnippets() {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSnippets(data);
      if (data.length > 0 && !selectedSnippet) {
        setSelectedSnippet(data[0]);
      }
    }
    setLoading(false);
  }

  // Handle selection and switch view on mobile
  const handleSelectSnippet = (snippet) => {
    setSelectedSnippet(snippet);
    setMobileView("editor");
  };

  const handleUpdate = async (id, updatedCode) => {
    const { error } = await supabase
      .from('snippets')
      .update({ code: updatedCode })
      .eq('id', id);

    if (!error) {
      setSnippets(prev => prev.map(s => s.id === id ? { ...s, code: updatedCode } : s));
      console.log("Snippet updated successfully");
    } else {
      alert("Error saving: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`${userName}, are you sure you want to delete this snippet?`)) return;

    const { error } = await supabase
      .from('snippets')
      .delete()
      .eq('id', id);

    if (!error) {
      const updatedSnippets = snippets.filter(s => s.id !== id);
      setSnippets(updatedSnippets);
      // Return to list view on mobile after deletion
      setMobileView("list");
      if (selectedSnippet?.id === id) {
        setSelectedSnippet(updatedSnippets.length > 0 ? updatedSnippets[0] : null);
      }
    } else {
      alert("Error deleting snippet: " + error.message);
    }
  };

  useEffect(() => {
    async function getUserName() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      }
    }
    getUserName();
    fetchSnippets();
  }, []); 

  return (
    <div className="flex h-screen w-full bg-[#0B0B0C] text-white overflow-hidden relative">
      
      {/* 1. Sidebar: Hidden on mobile, fixed width on desktop */}
      <div className="hidden md:block">
        <Sidebar 
          count={snippets.length} 
          planType="free" 
          onNewSnippet={() => setIsModalOpen(true)} 
        />
      </div>

      {/* 2. Snippet List Panel */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-white/5 shrink-0 h-full overflow-y-auto bg-white/1`}>
        {/* Mobile-only header for the list */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0B0B0C]">
          <h2 className="text-xl font-black tracking-tighter">My Snippets</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-purple-500 rounded-lg"
          >
            <Plus size={18} />
          </button>
        </div>

        <SnippetList 
          snippets={snippets} 
          onSelect={handleSelectSnippet} 
          activeId={selectedSnippet?.id}
          onNewSnippet={() => setIsModalOpen(true)} 
        />
      </div>

      {/* 3. Editor Panel */}
      <div className={`${mobileView === 'editor' ? 'flex' : 'hidden'} md:flex flex-col flex-1 h-full overflow-hidden bg-[#050505]`}>
        {/* Mobile-only back button header */}
        <div className="md:hidden flex items-center p-4 border-b border-white/5 bg-black">
          <button 
            onClick={() => setMobileView("list")}
            className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={20} /> Back to list
          </button>
        </div>

        <EditorPanel 
          snippet={selectedSnippet} 
          onSave={handleUpdate}
          onDelete={handleDelete}
        />
      </div>

      {/* 4. Modals */}
      {isModalOpen && (
        <CreateSnippetModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSnippets();
            setMobileView("list"); // Ensure we see the new snippet in the list
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;