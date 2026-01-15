import Markdown from 'react-markdown'

const Sflog = () => {
    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto select-text">
            <div className="pb-12">
                <Markdown>
                    {`
## How to run Sflog Traffic


### Enter SFLOG IPSM Card
\`\`\`
ent-card:loc=1108:type=ipsm:appl=ips:sflog=yes
chg-ip-lnk:loc=1108:port=a:ipaddr=10.75.147.105:submask=255.255.255.0:speed=100:duplex=full:mcast=no
ent-ip-host:host=ipsm1108a:ipaddr=10.75.147.105
chg-ip-card:loc=1108:srchordr=local:domain=new.com:defrouter=10.75.147.1
alw-card:loc=1108
\`\`\`

### Enter Meat Card

\`\`\`
ent-dstn:dpci=3-47-5
ent-card:loc=1207:type=slic:appl=ipsg
CHG-IP-LNK:loc=1207:IPADDR=10.254.101.49:PORT=A:SUBMASK=255.255.255.0:DUPLEX=FULL:SPEED=100:auto=no
CHG-IP-CARD:loc=1207:DEFROUTER=10.254.101.1
ent-ip-host:ipaddr=10.254.101.49:host=ipsg1207:type=local
ent-ip-host:ipaddr=10.254.101.197:host=meat001:type=remote
\`\`\`

### Configure links
\`\`\`
ent-ls:lsn=lsmeat001:lst=a:apci=3-47-5:adapter=m3ua:maxslktps=12000:ipsg=yes:rsvdslktps=93:tpsalmtype=maxslktps
ent-assoc:aname=meat001m3ua:lhost=ipsg1207:rhost=meat001:lport=8180:rport=5150:adapter=m3ua:bufsize=200
ent-slk:loc=1207:lsn=lsmeat001:slc=0:port=a:aname=meat001m3ua
ent-rte:dpci=3-47-5:lsn=lsmeat001:rc=10
chg-assoc:open=yes:aname=meat001m3ua
chg-ls:lsn=lsmeat001:rcontext=10
act-slk:loc=1207:port=a
rtrv-slk:loc=1207:port=a
rtrv-ls:lsn=lsmeat001
alw-card:loc=1207
\`\`\`

### Enter GTT Action
\`\`\`
ent-gttact:actid=sflog1:act=sflog
ent-gttaset:actsn=aset1:actid1=sflog1

ent-gttset:netdom=itu:gttsn=set1itu:settype=cdgta
ent-gttsel:gtii=2:tt=201:cdgttsn=set1itu
ent-gta:xlat=dpc:ri=gt:pci=3-47-5:gta=2222222220:gttsn=set1itu:actsn=aset1
\`\`\`


### Enter FTP Server for app=sflog
\`\`\`
ent-ftp-serv:path="/root/Sudhanshu/sflog":ipaddr=10.75.144.216:app=sflog:prio=1:security=on:login=root
Password : changeme
\`\`\`


Now run traffic from Meat :
\`
meat -n Network.xml -s Scenario.xml
\`
`}
                </Markdown>

            </div>

        </div>
    )
}

export default Sflog