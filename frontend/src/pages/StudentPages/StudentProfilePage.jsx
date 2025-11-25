import StudentNavigation from '../../components/student_components/StudentNavigation.jsx';
import Profile from "../../components/Authen/Profile";
import React from 'react';

const StudentProfilePage = () => {
  return (
    <>
      <StudentNavigation />

      <Profile />

    </>
  );
};

export default StudentProfilePage;