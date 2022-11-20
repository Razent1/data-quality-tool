import {combineReducers} from 'redux';

const SET_DB = 'SET_DB';
const SET_TABLE = 'SET_TABLE';
const SET_CHECKERS = 'SET_CHECKERS';
const SET_TIME = 'SET_TIME';
const SET_CHECKER_NAME = 'SET_CHECKER_NAME';
const SET_FILTRATION_CONDITION = 'SET_FILTRATION_CONDITION';
const SET_REPEATS = 'SET_REPEATS';
const SET_INTERVAL = 'INTERVAL';

export function setDatabase(db) {
    return {
        type: SET_DB,
        db
    }
}

export function setTable(table) {
    return {
        type: SET_TABLE,
        table
    }
}

export function setCheckers(checker) {
    return {
        type: SET_CHECKERS,
        checker
    }
}

export function setTime(time) {
    return {
        type: SET_TIME,
        time
    }
}

export function setCheckerName(checkerName) {
    return {
        type: SET_CHECKER_NAME,
        checkerName
    }
}

export function setFiltrationCondition(filtrationCondition) {
    return {
        type: SET_FILTRATION_CONDITION,
        filtrationCondition
    }
}

export function setRepeats(repeats) {
    return {
        type: SET_REPEATS,
        repeats
    }
}

export function setInterval(interval) {
    return {
        type: SET_INTERVAL,
        interval
    }
}

const defaultData =
    {
        db: null,
        table: null,
        checker: {
            duplication: false,
            nullCols: false,
            countRows: false,
            actualitySimple: false,
            actualityDifficulty: false
        },
        checkerName: null,
        filtrationCondition: null,
        time: '10:00',
        interval: null,
        repeats: {
            su: false,
            mo: false,
            tu: false,
            we: false,
            thu: false,
            fri: false
        }
    };

function data(state = defaultData, action) {
    switch (action.type) {
        case SET_DB:
            return (
                {
                    ...state,
                    db: action.db
                })
        case SET_TABLE:
            return (
                {
                    ...state,
                    table: action.table
                }
            )
        case SET_CHECKERS:
            return (
                {
                    ...state,
                    checker: action.checker
                }
            )
        case SET_TIME:
            return (
                {
                    ...state,
                    time: action.time
                }
            )
        case SET_CHECKER_NAME:
            return (
                {
                    ...state,
                    checkerName: action.checkerName
                }
            )
        case SET_FILTRATION_CONDITION:
            return (
                {
                    ...state,
                    filtrationCondition: action.filtrationCondition
                }
            )
        case SET_INTERVAL:
            return (
                {
                    ...state,
                    interval: action.interval
                }
            )
        case SET_REPEATS:
            return (
                {
                    ...state,
                    repeats: action.repeats
                }
            )
        default:
            return state;
    }
}

const exportData = combineReducers({
    data
});

export default exportData;