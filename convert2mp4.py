import argparse, os

def concat(m3u8):
    # concact
    m3u8 = os.path.abspath(m3u8)
    dir_name, file_name = os.path.split(m3u8)
    tmp_name = os.path.split(dir_name)[1] + ".ts"
    
    cmd = ("cd %s && ffmpeg -allowed_extensions ALL -protocol_whitelist "
           "\"file,http,crypto,tcp\" -i %s -c copy %s") % (dir_name, file_name, tmp_name)
    os.system(cmd)

    # convert
    mp4_dir = os.path.join(dir_name, "mp4")
    mp4_full_name = os.path.join(mp4_dir, os.path.split(dir_name)[1] + ".mp4")
    convert_cmd = ("mkdir -p %s && cd %s && ffmpeg -i %s -bsf:a aac_adtstoasc -c copy %s") % (mp4_dir, dir_name, tmp_name, mp4_full_name)
    os.system(convert_cmd)

# rm tmp
    rm_cmd = ("cd %s && rm %s") % (dir_name, tmp_name)
    os.system(rm_cmd)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("m3u8")
    args = parser.parse_args()
    concat(args.m3u8)
