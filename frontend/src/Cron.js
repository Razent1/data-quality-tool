import './App.css';

import 'bootstrap/dist/css/bootstrap.css';

import {useState, useEffect} from "react";
import TimePicker from 'react-time-picker';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import {purple} from '@mui/material/colors';
import Form from "react-bootstrap/Form";
import {setRepeats, setTime, setInterval} from './store/exportData/exportData';
import {useDispatch, useSelector} from "react-redux";

function Cron() {
    const [value, onChange] = useState('10:00');
    const [typeInfo, setTypeInfo] = useState('');
    const [typeWeek, setTypeWeek] = useState({
        sun: false,
        mon: false,
        tu: false,
        we: false,
        thu: false,
        fri: false
    });
    const exportData = useSelector(state => state.data);
    const dispatch = useDispatch();

    return (
        <div style={{marginTop: '25px', marginLeft: '55px'}}>
            <div className="headings" style={{marginBottom: '20px'}}>
                Scheduler
            </div>
            <div className="row" style={{marginBottom: '30px'}}>
                <div className="col-8">Choose the time of checking</div>
                <TimePicker onChange={onChange} value={value} className="col"/>
            </div>
            <div className="dropdownBlock" style={{borderBottom: "1px solid black"}}>
                <Form>
                    {['Every Hour', 'Every Day', 'Every Week', 'Every Month']
                        .map((type) => (
                            <div key={`${type}default-radio`} className="mb-3">
                                <Form.Check
                                    type="radio"
                                    id={`default-radio`}
                                    name="group1"
                                    label={`${type}`}
                                    onClick={(e) => {
                                        if (type === "Every Hour") {
                                            dispatch(setInterval(type));
                                            dispatch(setTime(value));
                                        } else if (type === "Every Day") {
                                            dispatch(setInterval(type));
                                            dispatch(setTime(value));
                                        } else if (type === "Every Week") {
                                            dispatch(setInterval(type));
                                            dispatch(setTime(value));
                                        } else if (type === "Every Month") {
                                            dispatch(setInterval(type));
                                            dispatch(setTime(value));
                                        }
                                    }}
                                />
                            </div>
                        ))}
                </Form>
            </div>
            <div className="dropdownBlock">
                <div className="headings" style={{marginBottom: '20px'}}>
                    Repeat every day of week
                </div>
                <Form>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        .map((type) => (
                            <div key={`inline-checkbox-${type}`} className="mb-3">
                                <Form.Check
                                    inline
                                    type="checkbox"
                                    name="group1"
                                    id={`inline-checkbox-1${type}`}
                                    label={`${type}`}
                                    onClick={(e) => {
                                        if (type === "Sun") {
                                            dispatch(setRepeats({
                                                ...exportData.repeats,
                                                su: e.target.checked
                                            }))
                                        } else if (type === "Mon") {
                                            dispatch(setRepeats({
                                                ...exportData.repeats,
                                                mo: e.target.checked
                                            }))
                                        } else if (type === "Tue") {
                                            dispatch(setRepeats({
                                                ...exportData.repeats,
                                                tu: e.target.checked
                                            }))
                                        } else if (type === "Wed") {
                                            dispatch(setRepeats({
                                                ...exportData.repeats,
                                                we: e.target.checked
                                            }))
                                        } else if (type === "Thu") {
                                            dispatch(setRepeats({
                                                ...exportData.repeats,
                                                thu: e.target.checked
                                            }))
                                        } else if (type === "Fri") {
                                            dispatch(setRepeats({
                                                ...exportData.repeats,
                                                fri: e.target.checked
                                            }))
                                        } else if  (type === "Sat") {
                                            dispatch(setRepeats({
                                                ...exportData.repeats,
                                                sat: e.target.checked
                                            }))
                                        }
                                    }}
                                />
                            </div>
                        ))}
                </Form>
            </div>
        </div>
    )
}

export default Cron;