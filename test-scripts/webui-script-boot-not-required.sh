set -x

DISK=$1

sgdisk --zap-all ${DISK}
sgdisk --new=0:0:+1MiB -t 0:ef02 ${DISK}
sgdisk --new=0:0:+300MiB ${DISK}
sgdisk --new=0:0:+10GiB ${DISK}
sgdisk --new=0:0:+1GiB ${DISK}
#sgdisk --new=0:0:0 ${DISK}
mkfs.ext4 ${DISK}2
mkfs.xfs -f ${DISK}3
mkfs.ext4 ${DISK}4

lsblk
blkid
