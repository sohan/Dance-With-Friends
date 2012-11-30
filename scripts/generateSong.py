

import mp3play
import Tkinter as tk
import time

song = open('rename_song', 'w')



filename = '../static/songs/gangamstyle.mp3'
mp3 = mp3play.load(filename)

mp3.play()

start_time = int(round(time.time() * 1000))

def keypress(event):
    if event.keysym == 'Escape':
        root.destroy()
    x = event.keycode
    if x == 37:
        code = 'l'
    elif x == 39:
        code = 'r'
    elif x == 40:
        code = 'd'
    else:
        return

    timestamp = int(round(time.time() * 1000)) - start_time;

    out = '{\'timestamp\': '+str(timestamp)+', \'type\': \''+code+'\'},\n'
    print out
    song.write(out);

root = tk.Tk()
print "Press a key (Escape key to exit):"
root.bind_all('<Key>', keypress)

# don't show the tk window
root.withdraw()
root.mainloop()

# Let it play for up to 30 seconds, then stop it.
import time
time.sleep(min(30, mp3.seconds()))
mp3.stop()