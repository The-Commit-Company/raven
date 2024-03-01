import React from 'react'

const DateItem = ({ date }) => {
    return (
        <div className='raven-date-separator'>
            <div className='raven-date-separator-line'>

            </div>
            <div className='raven-date-separator-text'>
                {moment(date, frappe.defaultDatetimeFormat).format('Do MMMM YYYY')}
            </div>
            <div className='raven-date-separator-line'></div>
        </div>
    )
}

export default DateItem