import './registerbody.css';
import React, { useState } from 'react';
import { FaLock, FaUser } from 'react-icons/fa';
import { HiIdentification } from "react-icons/hi2";
import { HiAtSymbol } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { BiSolidBuildingHouse } from "react-icons/bi";

const RegisterBody = () => {
    const [alert, setAlert] = useState('hide');
    const [alertMsg, setAlertMsg] = useState('');
    const [success, setSuccess] = useState(false);
    const [adminVerified, setAdminVerified] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [role, setRole] = useState('employee');
    const [department, setDepartment] = useState('');
    const navigate = useNavigate();
    const [employeeType, setEmployeeType] = useState('');
    const [college, setCollege] = useState('');
    const [office, setOffice] = useState('');

    const colleges = {
        'College of Engineering and Architecture (CEA)': [
            'Architecture', 'Chemical Engineering', 'Civil Engineering', 'Computer Engineering',
            'Electrical Engineering', 'Electronics Engineering', 'Industrial Engineering', 'Mechanical Engineering', 'Mining Engineering'
        ],
        'College of Computer Studies (CSS)': [
            'Information Technology', 'Computer Science'
        ],
        'College of Arts, Science and Education (CASE)': [
            'Department of Mathematics and Natural Sciences (DMNS)',
            'Department of Languages, Literature, and Communication (DLLC)',
            'Department of Humanities and Behavioral Sciences (DHBS)', 'Teacher-Education', 'Physical Education Department'
        ],
        'College of Management, Business and Accountancy (CMBA)': [
            'Accountancy Department', 'Business Administration Department', 'Office Administration Department', 'Public Administration', 'Hospitality and Tourism Management Department'
        ],
        'College of Nursing and Allied Health Sciences (CNAAHS)': [
            'Bachelor of Science in Nursing', 'BS Pharmacy'
        ],
        'College of Criminal Justice (CCJ)': [
            'Bachelor of Science in Criminology'
        ]
    };

    // Dropdown data for Offices
    const offices = [
        'Office of the University President', 'Office of the University Vice President', 'Library',
        'University Registrar’s Office', 'Guidance Center', 'Student Success Office',
        'Office of Admission and Scholarships', 'Alumni Affairs Office', 'Medical and Dental Clinic',
        'Accounting', 'Safety and Security Office', 'Office of Property Custodian',
        'Innovation and Technology Support Office', 'Community Extension Services Office',
        'Enrolment Technical Office', 'Information Systems Development Office', 'Center for E-Learning and Technology Education',
        'Instructional Materials and Publication Office', 'Technical Support Group',
        'Multimedia Solutions and Documentation Office', 'Athletics', 'Wildcat Innovation Labs',
        'Makerspace', 'Research and Development Coordinating Office'
    ];

    const infoPop = (message, isSuccess = false) => {
        setAlert('show');
        setAlertMsg(message);
        setSuccess(isSuccess);
    };

    const closeInfoPop = () => {
        setAlert('hide');
        if (success) {
            navigate('/'); 
        }
    };

    const handleRegister = () => {
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
    
        // Input validations
        if (!firstName || !lastName || !email || !password || !confirmPass || !schoolId || !employeeType) {
            infoPop('All fields are required.');
            return;
        }
    
        // Check if specific fields for the employee type are filled
        if (employeeType === 'faculty' && (!college || !department)) {
            infoPop('Please select both a college and a department.');
            return;
        }
    
        if (employeeType === 'office' && !office) {
            infoPop('Please select an office.');
            return;
        }
    
        if (!schoolId.match(isValidSchoolId)) {
            infoPop('Invalid School ID format! Please use the format xx-xxxx-xxx.');
            return;
        }
    
        if (!email.match(isValidEmail)) {
            infoPop('Please use a valid cit.edu email address to register.');
            return;
        }
    
        if (confirmPass !== password) {
            infoPop('Make sure your passwords match! Try again.');
            return;
        }
    
        // Check for existing email
        fetch(`http://localhost:8080/services/exists?email=${email}`, requestOptionsGET)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                if (data === true) {
                    infoPop('That email is already in use! Please use another email.');
                } else {
                    // Check for existing school ID
                    fetch(`http://localhost:8080/services/exists?schoolId=${schoolId}`, requestOptionsGET)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then((data) => {
                            if (data === true) {
                                infoPop('That School ID is already in use! Please use another School ID.');
                            } else {
                                // Proceed with registration
                                fetch(`http://localhost:8080/services/NewUserRegistration?firstName=${firstName}&lastName=${lastName}&password=${password}&email=${email}&schoolId=${schoolId}&role=${role}&adminVerified=${adminVerified}&college=${college}&department=${department}&office=${office}`, requestOptionsPOST)
                                    .then((response) => {
                                        if (!response.ok) {
                                            throw new Error('Network response was not ok');
                                        }
                                        return response.json();
                                    })
                                    .then(() => {
                                        infoPop("Registration successful! Wait for admin's confirmation", true);
                                        // Clear form fields
                                        setFirstName('');
                                        setLastName('');
                                        setPassword('');
                                        setEmail('');
                                        setConfirmPass('');
                                        setSchoolId('');
                                        setRole('');
                                        setDepartment('');
                                        setCollege('');
                                        setOffice('');
                                        setEmployeeType('');
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        infoPop('An error occurred during registration. Please try again.');
                                    });
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            infoPop('An error occurred while checking the School ID. Please try again.');
                        });
                }
            })
            .catch(error => {
                console.log(error);
                infoPop('An error occurred while checking the email. Please try again.');
            });
    };
    
    

    return (
        <div className="form-container">
            <div id="infoPopOverlay" className={alert}></div>
            <div id="infoPop" className={alert}>
                <p>{alertMsg}</p>
                <button id="infoChangeBtn" onClick={closeInfoPop}>Close</button>
            </div>
            <form>
                <h2 style={{marginBottom: '4vw'}}>Registration</h2>
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
                            <FaLock />
                            <input
                                className="regShad"
                                type="password"
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                                placeholder="Confirm Password"
                            />
                        </label>
                    </div>

                    {/* Second Column */}
                    <div className="column">
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
                        <label htmlFor="employeeType">Employee Type</label>
                        <select
                                style={{fontSize: '.85em', marginLeft: '1.5vw'}}
                                value={employeeType}
                                onChange={(e) => setEmployeeType(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select Employee Type</option>
                                <option value="faculty">Faculty Employee</option>
                                <option value="office">Office Employee</option>
                        </select>
                
                        {employeeType === 'faculty' && (
                            <>
                                <label>
                                    <select
                                    style={{marginLeft: '1.5vw'}}
                                        className="regShad"
                                        value={college}
                                        onChange={(e) => setCollege(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select College</option>
                                        {Object.keys(colleges).map((collegeName) => (
                                            <option key={collegeName} value={collegeName}>{collegeName}</option>
                                        ))}
                                    </select>
                                </label>
    
                                {college && (
                                    <label>
                                        <select
                                        style={{marginLeft: '1.5vw'}}
                                            className="regShad"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select Department</option>
                                            {colleges[college].map((dept, index) => (
                                                <option key={index} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                            </>
                        )}
    
                        {/* Show Office if Office Employee */}
                        {employeeType === 'office' && (
                            <label>
                                <select
                                    style={{marginLeft: '1.5vw'}}
                                    className="regShad"
                                    value={office}
                                    onChange={(e) => setOffice(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Office</option>
                                    {offices.map((officeName, index) => (
                                        <option key={index} value={officeName}>{officeName}</option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                </div>

                <div className="register-button">
                        <button className="register-button" type="button" onClick={handleRegister}>
                            Register
                        </button>
                    </div>

                <div className="aregistered">
                        <p id="regQues">ALREADY REGISTERED? </p>
                    </div>
                    <a id="signIn" href="/"> Sign In</a>
            </form>
        </div>
    );
    
};

export default RegisterBody;
