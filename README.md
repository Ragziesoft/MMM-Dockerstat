# MMM-Dockerstat
This module attempts to checks the status of docker containers running on another Raspberry Pi machine in the same network, and displays the status on the MagicMirror.
The entire code of this module has been written with help by ChatGPT. I had to constantly task it to refine different aspects of the module and create a working code.
The code appears to run and displays a rotating icon to indicate the status.However, it is actually not able to probe and actually check the status. ChatGPT is unable to make it work the way it is designed to (at the moment) and is going into a loop with various suggestions. So it needs to be debugged. I am uploading the code in an attempt for the community to do the debugging and make it work. The idea is to check the status of Docker, list all containers with their current status.
