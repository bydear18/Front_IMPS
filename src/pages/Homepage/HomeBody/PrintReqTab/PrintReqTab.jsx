import './printreq.css';

import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

function PrintReq({ onRequestSubmitted }) {
    // Regular expression for validating copies input
    const copiesRegex = /^\d{1,4}$/;

    // State variables
    const [alert, setAlert] = useState('hide');
    const [alertMsg, setAlertMsg] = useState('');
    const [success, setSuccess] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isHead, setIsHead] = useState(true);
    const [isStaff, setIsStaff] = useState(false);
    const [buttonSubmit, setButtonSubmit] = useState(false);
    const [init, setInit] = useState(true);
    const [disable, setDisable] = useState(true);
    const [file, setFile] = useState();
    const [paperType, setPaperType] = useState('Bondpaper');
    const [url, setUrl] = useState('');
    const [requestType, setRequestType] = useState('Select');
    const [noOfCopies, setNoOfCopies] = useState();
    const [colorType, setColorType] = useState('Colored');
    const [paperSize, setPaperSize] = useState('Short');
    const [description, setDescription] = useState('');
    const [comment, setComment] = useState('');
    const [requestID, setRequestID] = useState('');
    const [giveExam, setGiveExam] = useState(false);

    const schoolId = localStorage.getItem("schoolId");
    const userID = localStorage.getItem("userID");
    const email = localStorage.getItem("email");
    const name = `${localStorage.getItem("firstName")} ${localStorage.getItem("lastName")}`;
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        setDepartment(localStorage.getItem("department") || '');
        setRole(localStorage.getItem("role") || '');
    }, []);

    // Handle file selection
    const handleFile = (e) => {
        setFile(e.target.files[0]);
    };

    // Toggle exam-related state
    const handleExamToggle = () => {
        setGiveExam(prev => !prev);
    };

    // Handle number of copies input
    const handleNoOfCopies = (e) => {
        const value = e.target.value;
        setNoOfCopies(value);

        if (!copiesRegex.test(value)) {
            showAlert("Please input a proper number of copies!");
            setNoOfCopies('');
        }
    };

    const handlePaperSize = (e) => {
        setPaperSize(e.target.value);
    };

    const handlePaperType = (e) => {
        setPaperType(e.target.value);
    };

    const handleColorChange = (e) => {
        setColorType(e.target.value);
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    // Get current date
    const getDate = () => {
        return new Date().toISOString().substring(0, 10);
    };

    // Get minimum date (7 days from today)
    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 7);
        return today.toISOString().substring(0, 10);
    };

    const [currentDate, setCurrentDate] = useState(getDate());
    const [useDate, setUseDate] = useState('');
    const minDate = getMinDate();

    const handleUseDateChange = (e) => {
        const selectedDate = e.target.value;
        if (new Date(selectedDate) < new Date(minDate)) {
            showAlert('Please select a date at least 7 days from today!');
            setUseDate(''); // Reset input if the date is invalid
        } else {
            setUseDate(selectedDate);
        }
    };

    // Show alert function
    const showAlert = (message, isSuccess = false) => {
        setAlert('show');
        setAlertMsg(message);
        setSuccess(isSuccess);
    };

    const closeAlert = () => {
        setAlert('hide');
        if (success) {
            window.location.reload();
        }
    };

    // Upload function
    const upload = () => {
        const isFileRequired = !giveExam; // No file needed if exam is being given

        if (requestType !== 'Select' && noOfCopies > 0 && (file || !isFileRequired) && useDate && description) {
            const data = new FormData();
            data.append('userID', userID);
            data.append('role', role);
            data.append('isHead', isHead);
            data.append('isAdmin', isAdmin);
            data.append('isStaff', isStaff);
            data.append('requestID', requestID);
            data.append('fileType', requestType);
            data.append('desc', description);
            data.append('noOfCopies', noOfCopies);
            data.append('schoolId', schoolId);
            data.append('colored', colorType);
            data.append('paperSize', paperSize);
            data.append('paperType', paperType);
            data.append('requestDate', currentDate);
            data.append('useDate', useDate);
            data.append('name', name);
            data.append('email', email);
            data.append('department', department);

            const commentData = new FormData();
            commentData.append("sentBy", name);
            commentData.append("header", "Initial Comment");
            commentData.append("content", comment);
            commentData.append("sentDate", currentDate);
            commentData.append("requestID", requestID);

            if (isFileRequired && file) {
                setButtonSubmit(true);
                // Upload file to Firebase Storage
                const storage = getStorage(initializeApp());
                const storageRef = ref(storage, `files/${file.name}`);
                uploadBytes(storageRef, file).then(() => {
                    // Get download URL
                    getDownloadURL(storageRef).then((url) => {
                        setUrl(url);
                        data.append('URL', url);
                        data.append('fileName', file.name);
                        data.append('giveExam', giveExam);
                        submitRequest(data, commentData);
                    });
                }).catch(error => {
                    console.error("Error uploading file:", error);
                });
            } else {
                // If no file is required, proceed without upload
                data.append('fileName', 'None');
                data.append('URL', 'None');
                data.append('giveExam', giveExam);
                submitRequest(data, commentData);
            }
        } else {
            showAlert('Please make sure you filled up all the fields');
        }
    };

    const submitRequest = (data, commentData) => {
        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            body: data,
        };

        fetch(`${process.env.REACT_APP_BACKEND_URL}/requests/newRequest`, requestOptions)
            .then(response => response.json())
            .then(() => {
                if (comment) {
                    const commentOptions = {
                        method: 'POST',
                        mode: 'cors',
                        body: commentData,
                    };

                    fetch("http://localhost:8080/comments/newComment", commentOptions)
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                        }).catch(error => {
                            console.error("Error posting comment:", error);
                        });
                }
                showAlert('Request submitted successfully!', true);
            }).catch(error => {
                console.error("Error submitting request:", error);
            });
    };

    const disableIn = (value) => {
        let tag = '';
        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        switch (value) {
            case 'Module':
                setRequestType('Module');
                tag = "MD0";
                break;
            case 'Office':
                setRequestType('Office Form');
                tag = "OF0";
                break;
            case 'Exam':
                setRequestType('Exam');
                tag = "EX0";
                setDisable(false);
                break;
            case 'Manual':
                setRequestType('Manual');
                tag = "MA0";
                break;
            case 'Select':
                setInit(true);
                break;
            default:
                return;
        }

        if (value !== 'Select') {
            fetch(`http://localhost:8080/records/generateid?fileType=${value}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    setRequestID(tag + (data + 1).toString());
                    setDisable(value !== 'Exam');
                    setInit(false);
                }).catch(error => {
                    console.error("Error fetching request ID:", error);
                });
        } else {
            setRequestID("");
        }
    };

    return (
        <div id="reqContainer">
            <div id="infoPopOverlay" className={alert}></div>
            <div id="infoPop" className={alert}>
                <p>{alertMsg}</p>
                <button id='infoClose' onClick={closeAlert}>Close</button>
            </div>

            <h2 className="center">Print Request</h2>

            <div className="form-group">
                <label htmlFor="requestType">Request Type:</label>
                <select
                    id="requestType"
                    value={requestType}
                    onChange={(e) => disableIn(e.target.value)}
                >
                    <option value="Select">Select</option>
                    <option value="Module">Module</option>
                    <option value="Office">Office</option>
                    <option value="Exam">Exam</option>
                    <option value="Manual">Manual</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="noOfCopies">Number of Copies:</label>
                <input
                    id="noOfCopies"
                    type="number"
                    value={noOfCopies}
                    onChange={handleNoOfCopies}
                    placeholder="Enter number of copies"
                />
            </div>

            <div className="form-group">
                <label htmlFor="useDate">Date to be used:</label>
                <input
                    id="useDate"
                    type="date"
                    value={useDate}
                    min={minDate}
                    onChange={handleUseDateChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description"
                />
            </div>

            <div className="form-group">
                <label htmlFor="comment">Comment (optional):</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Enter a comment"
                />
            </div>

            <div className="form-group">
                <label htmlFor="file">Upload File:</label>
                <input
                    id="file"
                    type="file"
                    onChange={handleFile}
                />
            </div>

            <div className="form-group">
                <label>Paper Type:</label>
                <select value={paperType} onChange={handlePaperType}>
                    <option value="Bondpaper">Bondpaper</option>
                    <option value="Cartolina">Cartolina</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-group">
                <label>Paper Size:</label>
                <select value={paperSize} onChange={handlePaperSize}>
                    <option value="Short">Short</option>
                    <option value="Long">Long</option>
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                </select>
            </div>

            <div className="form-group">
                <label>Color Type:</label>
                <select value={colorType} onChange={handleColorChange}>
                    <option value="Colored">Colored</option>
                    <option value="Black and White">Black and White</option>
                </select>
            </div>

            <div className="form-group">
                <label>
                    <input
                        type="checkbox"
                        checked={giveExam}
                        onChange={handleExamToggle}
                    />
                    Give Exam?
                </label>
            </div>

            <button
                onClick={upload}
                disabled={disable || buttonSubmit}
            >
                Submit
            </button>
        </div>
    );
}

export default PrintReq;
