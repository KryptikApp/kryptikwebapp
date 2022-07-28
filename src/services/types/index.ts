enum ServiceState{
    started=0,
    stopped=1,
    unstarted=2
}

enum Status
{
    Success = 0,
    Failure = 1,
    Pending = 2,
    Done = 3
}

enum TxProgress{
    Begin = 0,
    SetParamaters = 1,
    Rewiew = 2,
    Complete = 3,
    Failure = 4
}


enum WaitlistProgress{
    Begin=0,
    Complete=1,
    Failure=2
}

export{ServiceState, Status, TxProgress, WaitlistProgress}

