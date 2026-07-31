import { useDropzone } from "react-dropzone";

export default function Dropzone({
    children,
    onFiles,
}) {

        const {
        getRootProps,
        getInputProps,
        open,
        isDragActive,
        } = useDropzone({
        multiple: true,
        noClick: true,
        noKeyboard: true,
        onDrop: onFiles,
        });

    return (

        <div
            {...getRootProps()}
            className="relative"
        >

            <input {...getInputProps()} />

            {children}

            {isDragActive && (

                <div
                    className="
                        absolute
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        rounded-3xl
                        border-2
                        border-dashed
                        border-cyan-500
                        bg-cyan-50/90
                    "
                >

                    <p className="text-lg font-semibold text-cyan-700">

                        Drop files to upload

                    </p>

                </div>

            )}

        </div>

    );

}