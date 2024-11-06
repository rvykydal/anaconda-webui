set -x

DISK=$1

sgdisk --zap-all ${DISK}
sgdisk --new=0:0:+1MiB --typecode=0:ef02 ${DISK}
sgdisk --new=0:0:+1GB ${DISK}
mkfs.xfs -f ${DISK}2
sgdisk --new=0:0:+1GB ${DISK}
mkfs.xfs -f ${DISK}3
sgdisk --new=0:0:+1GB ${DISK}
mkfs.xfs -f ${DISK}4
sgdisk --new=0:0:+10GiB ${DISK}
mkfs.xfs -f ${DISK}5

echo ===========================================================================================

echo einszwei | cryptsetup luksFormat ${DISK}2
echo einszwei | cryptsetup luksOpen ${DISK}2 encrypted-vol0
mkfs.xfs -f /dev/mapper/encrypted-vol0
cryptsetup luksClose encrypted-vol0
echo einszweidrei | cryptsetup luksFormat ${DISK}3
echo einszweidrei | cryptsetup luksOpen ${DISK}3 encrypted-vol1
mkfs.xfs -f /dev/mapper/encrypted-vol1
cryptsetup luksClose encrypted-vol1
echo einszweidreivier | cryptsetup luksFormat ${DISK}4
echo einszweidreivier | cryptsetup luksOpen ${DISK}4 encrypted-vol2
mkfs.xfs -f /dev/mapper/encrypted-vol2
cryptsetup luksClose encrypted-vol2

echo ===========================================================================================

lsblk
