using System.Security.Cryptography;

namespace Alaik.Infrastructure.Auth;

public interface ISlugGenerator
{
    string New();
}

public class SlugGenerator : ISlugGenerator
{
    // Unambiguous alphabet (no 0/O/1/l/I) for shareable public links.
    private const string Alphabet = "abcdefghjkmnpqrstuvwxyz23456789";

    public string New()
    {
        Span<char> chars = stackalloc char[8];
        for (var i = 0; i < chars.Length; i++)
            chars[i] = Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)];
        return new string(chars);
    }
}
