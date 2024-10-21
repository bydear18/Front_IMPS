import './AdminAccount.css';
import React, { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { FaLock, FaUser } from 'react-icons/fa';
import { HiIdentification } from "react-icons/hi2";
import { HiAtSymbol } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [values, setValues] = useState([]);
  const [alert, setAlert] = useState('hide');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [role, setRole] = useState('staff');
  const navigate = useNavigate();


  const renderHeader = () => {
    return (
      <div id="userHeader" className="flex">
        <h1>Employee Management</h1>
      </div>
    );
  };
  
  const renderStaffHeader = () => {
    return (
      <div id="userHeader" className="flex">
        <h1>Staff Management</h1>
      </div>
    );
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const header = renderHeader();
  const staffHeader = renderStaffHeader();
  const handleLogOut = () => {
    localStorage.setItem('firstName', '');
    localStorage.setItem('lastName', '');
    localStorage.setItem('email', '');
    localStorage.setItem('userID', '');
    localStorage.setItem('isLoggedIn', '');
    navigate('/');
  };

  const showInfoPop = (message, isSuccess = false) => {
    setAlert('show');
    setAlertMsg(message);
    setSuccess(isSuccess);
  };
  const fetchData = () => {
    fetch('http://localhost:8080/services/all')
      .then((response) => response.json())
      .then((data) => {
        const filteredUsers = data.filter(
          (user) => user.role === 'staff'
        );
        setValues(filteredUsers);
      })
      .catch((error) => {
        console.error('Error fetching staff list:', error);
      });
  };
  const closeInfoPop = () => {
    setAlert('hide');
    if (success) {
      window.location.reload();
    } else {
      setTimeout(() => {
        fetchData();
      }, 1000);
    }
  };

  useEffect(() => {
    const requestOptions = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    fetch('http://localhost:8080/services/all', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        // Filter users based on role
        const filteredUsers = data.filter(
          (user) => user.role === 'employee' || user.role === 'staff'
        );
        setValues(filteredUsers);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleAccept = (userEmail) => {
    console.log(userEmail);
    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail }),
    };

    fetch('http://localhost:8080/services/updateAdminVerified', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.status) {
          console.log('User accepted:', userEmail);
          setValues((prevValues) => prevValues.filter(user => user.email !== userEmail));
          showInfoPop(`User registration accepted!`, true);
        } else {
          console.error('Error accepting user:', data.message);
          showInfoPop(`Error accepting user: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        showInfoPop('An error occurred while accepting the user.');
      });
  };

  const handleDecline = (userEmail) => {
    console.log(userEmail);
    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail }),
    };

    fetch('http://localhost:8080/services/declineUser', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.status) {
          console.log('User declined:', userEmail);
          setValues((prevValues) => prevValues.filter(user => user.email !== userEmail));
          showInfoPop(`User registration declined!`, true);
        } else {
          console.error('Error declining user:', data.message);
          showInfoPop(`Error declining user: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        showInfoPop('An error occurred while declining the user.');
      });
  };

  const roleBodyTemplate = (rowData) => {
    if(rowData.role === 'staff'){
      return (
        <div>
          <button onClick={() => handleAccept(rowData.email)} className='accept-button'>
            Edit
          </button>
          <button onClick={() => handleDecline(rowData.email)} className='decline-button'>
            Delete
          </button>
        </div>
      );
    }
    else if(rowData.role === 'employee' && rowData.adminVerified === true){
      return (
        <div>
          <button onClick={() => handleAccept(rowData.email)} className='accept-button'>
            Accept
          </button>
          <button onClick={() => handleDecline(rowData.email)} className='decline-button'>
            Decline
          </button>
        </div>
      );
    }
    else{

    }

  };
  const closeButton = ()=>{
    setIsModalOpen(false);
  }
  const handleAddStaff = ()=>{
    setIsModalOpen(true);
  }
  const addStaff = () => {
    const requestOptionsGET = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const requestOptionsPOST = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const isValidSchoolId = /^\d{2}-\d{4}-\d{3}$/;
    const isValidEmail = /^[a-zA-Z0-9._%+-]+@cit\.edu$/;

    if (!firstName || !lastName || !email || !password || !schoolId) {
      showInfoPop('All fields are required.');
        return;
    }

    if (!schoolId.match(isValidSchoolId)) {
      showInfoPop('Invalid School ID format! Please use the format xx-xxxx-xxx.');
        return;
    }

    if (!email.match(isValidEmail)) {
      showInfoPop('Please use a valid cit.edu email address to register.');
        return;
    }


    fetch(`http://localhost:8080/services/exists?email=${email}`, requestOptionsGET)
        .then((response) => response.json())
        .then((data) => {
            if (data === true) {
              showInfoPop('That email is already in use! Please use another email.');
            } else {
                fetch(`http://localhost:8080/services/exists?schoolId=${schoolId}`, requestOptionsGET)
                    .then((response) => response.json())
                    .then((data) => {
                        if (data === true) {
                          showInfoPop('That School ID is already in use! Please use another School ID.');
                        } else {
                            fetch(`http://localhost:8080/services/NewStaffRegistration?firstName=${firstName}&lastName=${lastName}&password=${password}&email=${email}&schoolId=${schoolId}&role=${role}`, requestOptionsPOST)
                                .then((response) => response.json())
                                .then(() => {
                                    setFirstName('');
                                    setLastName('');
                                    setPassword('');
                                    setEmail('');
                                    setSchoolId('');
                                    showInfoPop('Successfully Added Staff');
                                    
                                })
                                .catch(error => {
                                    console.log(error);
                                    showInfoPop('An error occurred during registration. Please try again.');
                                });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        })
        .catch(error => {
            console.log(error);
        });
};


  return (
    <div>
        <div id="infoPopOverlay" className={alert}></div>
        <div id="infoPop" className={alert}>
        <p>{alertMsg}</p>
        <button id="infoChangeBtn" onClick={closeInfoPop}>Close</button>
        </div>
        <div id="usersTable">
            <DataTable
                value={values.filter(user => user.role === 'employee')} 
                scrollable
                scrollHeight="15vw"
                header={header}
                emptyMessage="No data found."
                tableStyle={{ minWidth: '20vw' }}
                selectionMode="single"
            >
                <Column field="schoolId" header="School ID"></Column>
                <Column field="firstName" header="First Name"></Column>
                <Column field="lastName" header="Last Name"></Column>
                <Column field="email" header="Email"></Column>
                <Column field="role" header="Role"></Column>
                <Column field="Action" header="Action" body={roleBodyTemplate}></Column>
            </DataTable>
        </div>
        
        <button id='addStaff' onClick={() => handleAddStaff()}>Add Staff +</button>

        {isModalOpen && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="staff-container" onClick={(e) => e.stopPropagation()}>
            <div id="infoPopOverlay" className={alert}></div>
              <div id="infoPop" className={alert}>
                  <p>{alertMsg}</p>
                  <button id="infoChangeBtn" onClick={closeInfoPop}>Close</button>
              </div>
              <form>
                <h2 style={{ marginBottom: "4vw" }}>Add Staff</h2>
                <div className="form-row">
                  {/* First Column */}
                  <div className="column">
                    <label>
                      <FaUser />
                      <input
                        className="regShad"
                        required
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                      />
                    </label>
                    <label>
                      <FaUser />
                      <input
                        className="regInput regShad"
                        required
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                      />
                    </label>
                  </div>
                  <div className="column">
                    <label>
                      <HiAtSymbol id="emailSym" />
                      <input
                        className="regShad"
                        id="emailIn"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                      />
                    </label>
                    <label>
                      <FaLock />
                      <input
                        className="regShad"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                      />
                    </label>
                    <label>
                      <HiIdentification />
                      <input
                        className="regShad"
                        type="text"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        placeholder="School ID (xx-xxxx-xxx)"
                      />
                    </label>
                  </div>
                </div>

                <div className="register-button">
                  <button className="register-button" type="button" onClick={addStaff}>
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        <div id="usersTable" style={{marginTop: '-2vw'}}>
            <DataTable
                value={values.filter(user => user.role === 'staff')} 
                scrollable
                scrollHeight="15vw"
                header={staffHeader}
                emptyMessage="No data found."
                tableStyle={{ minWidth: '20vw' }}
                selectionMode="single"
            >
                <Column field="schoolId" header="School ID"></Column>
                <Column field="firstName" header="First Name"></Column>
                <Column field="lastName" header="Last Name"></Column>
                <Column field="email" header="Email"></Column>
                <Column field="role" header="Role"></Column>
                <Column field="Action" header="Action" body={roleBodyTemplate}></Column>
            </DataTable>
        </div>

    </div>
);

};

export default UserManagement;
