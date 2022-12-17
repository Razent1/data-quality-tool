import {combineReducers} from 'redux';

const SET_DB = 'SET_DB';
const SET_TABLE = 'SET_TABLE';
const SET_ALL_COLUMNS = 'SET_ALL_COLUMNS'
const SET_COLUMNS = 'SET_COLUMNS';
const DELETE_COLUMNS = 'DELETE_COLUMNS'
const SET_NULL_COLUMNS = 'SET_NULL_COLUMNS'
const DELETE_NULL_COLUMNS = 'DELETE_NULL_COLUMNS'
const SET_ACTUALITY = 'SET_ACTUALITY'
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

export function setAllColumns(allColumns) {
    return {
        type: SET_ALL_COLUMNS,
        allColumns
    }
}

export function setColumns(columns) {
    return {
        type: SET_COLUMNS,
        columns
    }
}

export function deleteColumns(deletedColumns) {
    return {
        type: DELETE_COLUMNS,
        deletedColumns
    }
}

export function setNullColumns(nullColumns) {
    return {
        type: SET_NULL_COLUMNS,
        nullColumns
    }
}

export function deleteNullColumns(deletedNullColumns) {
    return {
        type: DELETE_NULL_COLUMNS,
        deletedNullColumns
    }
}

export function setActuality(actuality) {
    return {
        type: SET_ACTUALITY,
        actuality
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
        allColumns: null,
        columns: [],
        nullColumns: [],
        actuality: {actualitySimple: null, actualityDifficulty: null},
        checker: {
            duplication: false,
            nullCols: false,
            countRows: false,
            actualitySimple: false,
            actualityDifficulty: false
        },
        checkerName: '',
        filtrationCondition: '',
        time: '10:00',
        interval: null,
        repeats: {
            su: false,
            mo: false,
            tu: false,
            we: false,
            thu: false,
            fri: false,
            sat: false
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
        case SET_ALL_COLUMNS:
            return (
                {
                    ...state,
                    allColumns: action.allColumns
                }
            )
        case SET_COLUMNS:
            if (Array.isArray(action.columns) && action.columns.length === 0) {
                state.columns = [];
            } else {
                if (!state.columns.includes(action.columns)) {
                    state.columns.push(action.columns);
                }
            }
            return (
                {
                    ...state,
                    columns: state.columns
                }
            )
        case DELETE_COLUMNS:
            const filteredColumns = state.columns.filter((col) => col !== action.deletedColumns);
            return (
                {
                    ...state,
                    columns: filteredColumns
                }
            )
        case SET_NULL_COLUMNS:
            if (Array.isArray(action.nullColumns) && action.nullColumns.length === 0) {
                state.nullColumns = [];
            } else {
                if (!state.nullColumns.includes(action.nullColumns)) {
                    state.nullColumns.push(action.nullColumns);
                }
            }
            return (
                {
                    ...state,
                    nullColumns: state.nullColumns
                }
            )
        case DELETE_NULL_COLUMNS:
            const filteredNullColumns = state.nullColumns.filter((col) => col !== action.deletedNullColumns);
            return (
                {
                    ...state,
                    nullColumns: filteredNullColumns
                }
            )
        case SET_ACTUALITY:
            const newActuality = {
                actualitySimple: action.actuality['actualitySimple'],
                actualityDifficulty: action.actuality['actualityDifficulty']
            }
            return (
                {
                    ...state,
                    actuality: newActuality
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