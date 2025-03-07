import { useParams } from 'react-router-dom';
import ProjectEditFormV3 from '@/components/input/forms/ProjectEditFormV3';

export default function EditProjectPage() {
  const { id } = useParams();
  return <ProjectEditFormV3 projectId={id} />;
}

