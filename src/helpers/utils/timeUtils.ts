// taken from: https://bobbyhadz.com/blog/typescript-date-difference-in-days

export function timeElapsedString(startDate: Date, endDate: Date){
    const numDaysElapsed = getDaysElapsed(startDate, endDate);
    const daysInAMonth = 31;
    const daysInaYear = 365;
    // days
    if(numDaysElapsed<7){
        // case for correct plural
        if(numDaysElapsed==1){
            return `1 day ago`
        }
        else{
            return `${numDaysElapsed} days ago`
        }
    }
    // weeks
    else if(numDaysElapsed<daysInAMonth){
        const numWeeksElapsed = Math.floor(numDaysElapsed/daysInAMonth);
        // case for correct plural
        if(numWeeksElapsed <= 1){
            return `1 week ago`
        }
        else{
            return `${numWeeksElapsed} weeks ago`
        }
    }
    // months
    else if(numDaysElapsed<daysInaYear){
        const numMonthsElapsed = Math.floor(numDaysElapsed/daysInAMonth);
        if(numMonthsElapsed <= 1){
            return `1 month ago`
        }
        else{
            return `${numMonthsElapsed} months ago`
        }
    }
    else{
        const numYearsElapsed = Math.floor(numDaysElapsed/daysInAMonth);
        if(numYearsElapsed <= 1){
            return `1 year ago`
        }
        else{
            return `${numYearsElapsed} years ago`
        }
    }
}

  
export function getDaysElapsed(startDate: Date, endDate: Date): number {
    const msInDay = 24 * 60 * 60 * 1000;
  
    // 👇️ explicitly calling getTime()
    return Math.round(
      Math.abs(endDate.getTime() - startDate.getTime()) / msInDay,
    );
}