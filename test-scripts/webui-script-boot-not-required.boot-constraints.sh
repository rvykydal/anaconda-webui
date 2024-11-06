set -x

DISK=$1

sgdisk --zap-all ${DISK}
#1
sgdisk --new=0:0:+1MiB -t 0:ef02 ${DISK}
#2
sgdisk --new=0:0:+10GiB ${DISK}
#3
sgdisk --new=0:0:+1GiB ${DISK}
#4
sgdisk --new=0:0:+1GiB ${DISK}
#sgdisk --new=0:0:0 ${DISK}
mkfs.xfs -f ${DISK}2
echo einszweidrei | cryptsetup luksFormat ${DISK}3
echo einszweidrei | cryptsetup luksOpen ${DISK}3 encrypted-vol1
mkfs.xfs -f /dev/mapper/encrypted-vol1
cryptsetup luksClose encrypted-vol1
#mkfs.xfs -f ${DISK}3
mkfs.xfs -f ${DISK}4
#mkfs.ext4 ${DISK}2
#mkfs.ext4 ${DISK}4

lsblk
blkid
