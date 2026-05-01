import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import SnippetList from "../components/SnippetList";
import EditorPanel from "../components/EditorPanel";
import CreateSnippetModal from "../components/CreateSnippetModal"; 
import { supabase } from "../lib/supabase";

function Dashboard() {
  const [snippets, setSnippets] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("Developer");

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

  // --- NEW: Update Logic ---
  const handleUpdate = async (id, updatedCode) => {
    const { error } = await supabase
      .from('snippets')
      .update({ code: updatedCode })
      .eq('id', id);

    if (!error) {
      // Sync the local state so the sidebar and editor match
      setSnippets(prev => prev.map(s => s.id === id ? { ...s, code: updatedCode } : s));
      // Optional: Show a brief success message or toast
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
      <Sidebar 
        count={snippets.length} 
        planType="free" 
        onNewSnippet={() => setIsModalOpen(true)} 
      />

      <div className="w-80 border-r border-white/5 shrink-0 h-full overflow-y-auto bg-white/1">
        <SnippetList 
          snippets={snippets} 
          onSelect={setSelectedSnippet} 
          activeId={selectedSnippet?.id}
          onNewSnippet={() => setIsModalOpen(true)} 
        />
      </div>

      <div className="flex-1 h-full overflow-hidden bg-[#050505]">
        <EditorPanel 
          snippet={selectedSnippet} 
          onSave={handleUpdate} // Replaced the empty function with handleUpdate
          onDelete={handleDelete}
        />
      </div>

      {isModalOpen && (
        <CreateSnippetModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSnippets();
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;