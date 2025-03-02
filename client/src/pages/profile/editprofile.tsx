import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import ProfileEditForm from "@/components/input/forms/ProfileEditForm"

export default function ProfileEditPage() {
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
    
    // If no ID is provided in the URL, use the logged-in user's ID
    if (!id) {
      navigate(`/profile/${userId}/edit`);
      return;
    }
    
    // If trying to edit someone else's profile, redirect to own profile
    if (id !== userId) {
      navigate(`/profile/${userId}/edit`);
      return;
    }
  }, [id, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <ProfileEditForm />
    </div>
  )
}

