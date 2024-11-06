set -x

DISK=$1

sgdisk --zap-all ${DISK}
sgdisk --new=0:0:+1MiB -t 0:ef02 ${DISK}
sgdisk --new=0:0:+10GiB ${DISK}
mkfs.ext4 ${DISK}2

lsblk
blkid

