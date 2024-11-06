#!/bin/bash

SEC=$1

nmcli dev dis enp0s22
sleep $SEC
nmcli dev con enp0s22
