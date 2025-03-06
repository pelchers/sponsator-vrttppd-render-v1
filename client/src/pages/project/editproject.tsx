import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import ProjectEditFormV3 from "@/components/input/forms/ProjectEditFormV3"
import "./EditProject.css"

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-medium text-gray-900 mb-6">
          {id ? 'Edit Project' : 'Create New Project'}
        </h1>
        <ProjectEditFormV3 projectId={id} />
      </div>
    </div>
  )
}

