import numpy as np, wave
sr=44100; T=22.5; n=int(sr*T); t=np.arange(n)/sr
bpm=108; beat=60/bpm
out=np.zeros(n)
def add(sig,start):
    i=int(start*sr); j=min(n,i+len(sig)); 
    if i<n: out[i:j]+=sig[:j-i]
# kick
k=np.arange(int(.25*sr))/sr
kick=np.sin(2*np.pi*(55+90*np.exp(-k*30))*k)*np.exp(-k*14)*0.9
hat=lambda: (np.random.randn(int(.05*sr))*np.exp(-np.arange(int(.05*sr))/sr*90))*0.12
chords=[(220,261.6,329.6),(174.6,220,261.6),(130.8,164.8,196),(196,246.9,293.7)]
b=0
while b*beat<T:
    s=b*beat
    if s>1.4:
        if b%1==0: add(kick,s)
        add(hat(),s+beat/2)
    b+=1
bar=beat*4
for bi in range(int(T/bar)+1):
    s=bi*bar; ch=chords[bi%4]
    d=np.arange(int(bar*sr))/sr
    pad=sum(np.sin(2*np.pi*f*d)+0.4*np.sin(2*np.pi*2*f*d) for f in ch)/6
    env=np.minimum(1,d/0.3)*np.minimum(1,(bar-d)/0.2)
    add(pad*env*0.35,s)
    bass=np.sin(2*np.pi*ch[0]/2*d)*np.exp(-(d%beat)*3)*0.5
    add(bass,s)
# whooshes
for w in (1.5,4.0,7.5,18.5):
    d=np.arange(int(.5*sr))/sr
    x=np.random.randn(len(d))
    # crude lowpass sweep via cumulative smoothing
    k2=np.convolve(x,np.ones(40)/40,'same')
    add(k2*np.sin(np.pi*d/0.5)**2*0.5,w-0.25)
out*=np.minimum(1,(T-t)/1.5)
out/=np.abs(out).max()/0.8
w=wave.open('public/music.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr)
w.writeframes((out*32767).astype(np.int16).tobytes());w.close()
