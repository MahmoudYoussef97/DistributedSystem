def server_status(res):
    server = ''
    cpu = 0
    size = len(res)

    for i in range(size):
        if res[i] == 'S':
            server = res[i + 8]
        if res[i] == 'C':
            cpu = res[i + 5]
            if res[i + 6] != '%':
                cpu += res[i + 6]
                if res[i + 7] != '%':
                    cpu += res[i + 7]
            return [server, int(cpu)]
        
def giveTask(server, st, totalCpu,dataCount):
    if not server.status:
        server.task = [-1, -1]
        
    else:   
        server.task=[st,st + (totalCpu - server.cpu) * dataCount // 100]

def checkRem(server, dataCount):
    if(server.task[0] != -1):
        server.task[1] = dataCount
        return 1
    return 0


def taskDistribution(serverA, serverB, dataCount):
    totalCpu = 0
    lastUnused=0
    dataCount = int(dataCount)
    if serverA.status:
        totalCpu+= serverA.cpu
    
    if serverB.status:
        totalCpu+= serverB.cpu

    giveTask(serverA, lastUnused, totalCpu,dataCount)
    lastUnused = max(lastUnused, serverA.task[1] + 1)
    giveTask(serverB, lastUnused, totalCpu,dataCount)
    lastUnused = max(lastUnused, serverB.task[1] + 1)
    # giveTask(serverC, lastUnused, totalActive)
    
    if lastUnused <= int(dataCount):
        # if checkRem(serverC, dataCount)
        #     return
        if checkRem(serverB, dataCount):
            return
        checkRem(serverA, dataCount) 









